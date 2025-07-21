export interface AzureDevOpsConfig {
  organizationUrl: string;
  username: string;
  personalAccessToken: string;
}

export interface AzureWorkItem {
  id: number;
  fields: {
    'System.Title': string;
    'System.WorkItemType': string;
    'System.State': string;
    'Microsoft.VSTS.Common.Priority': number | string;
    'System.AssignedTo'?: {
      displayName: string;
    };
    'System.CreatedBy': {
      displayName: string;
    };
    'System.CreatedDate': string;
    'System.ChangedDate': string;
    'Microsoft.VSTS.Common.ResolvedDate'?: string;
    'System.TeamProject': string;
    'System.Tags'?: string;
  };
}

export interface AzureProject {
  id: string;
  name: string;
  description?: string;
  url: string;
  state: string;
}

export class AzureDevOpsService {
  private config: AzureDevOpsConfig;
  private baseUrl: string;
  private headers: HeadersInit;

  constructor(config: AzureDevOpsConfig) {
    this.config = config;
    this.baseUrl = `${config.organizationUrl}/_apis`;
    
    // Create basic auth header
    const auth = btoa(`${config.username}:${config.personalAccessToken}`);
    this.headers = {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  async getProjects(): Promise<AzureProject[]> {
    try {
      const response = await fetch(`${this.baseUrl}/projects?api-version=7.0`, {
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.value || [];
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  async getWorkItems(): Promise<AzureWorkItem[]> {
    try {
      // First, get work item IDs using WIQL
      const wiqlQuery = {
        query: `
          SELECT [System.Id], [System.Title], [System.State], [System.WorkItemType], 
                 [Microsoft.VSTS.Common.Priority], [System.AssignedTo], [System.CreatedBy],
                 [System.CreatedDate], [System.ChangedDate], [Microsoft.VSTS.Common.ResolvedDate],
                 [System.TeamProject], [System.Tags]
          FROM WorkItems 
          WHERE [System.TeamProject] = @project
          ORDER BY [System.ChangedDate] DESC
        `
      };

      // Get all projects first
      const projects = await this.getProjects();
      const allWorkItems: AzureWorkItem[] = [];

      // Fetch work items for each project
      for (const project of projects) {
        try {
          const projectWiqlQuery = {
            query: wiqlQuery.query.replace('@project', `'${project.name}'`)
          };

          const wiqlResponse = await fetch(
            `${this.baseUrl}/wit/wiql?api-version=7.0`,
            {
              method: 'POST',
              headers: this.headers,
              body: JSON.stringify(projectWiqlQuery)
            }
          );

          if (!wiqlResponse.ok) {
            console.warn(`Failed to fetch work items for project ${project.name}: ${wiqlResponse.status}`);
            continue;
          }

          const wiqlData = await wiqlResponse.json();
          const workItemIds = wiqlData.workItems?.map((wi: any) => wi.id) || [];

          if (workItemIds.length === 0) {
            console.log(`No work items found for project: ${project.name}`);
            continue;
          }

          // Batch fetch work item details (max 200 at a time)
          const batchSize = 200;
          for (let i = 0; i < workItemIds.length; i += batchSize) {
            const batch = workItemIds.slice(i, i + batchSize);
            const idsParam = batch.join(',');

            const detailsResponse = await fetch(
              `${this.baseUrl}/wit/workitems?ids=${idsParam}&api-version=7.0&$expand=fields`,
              {
                headers: this.headers
              }
            );

            if (detailsResponse.ok) {
              const detailsData = await detailsResponse.json();
              allWorkItems.push(...(detailsData.value || []));
            }
          }
        } catch (projectError) {
          console.warn(`Error fetching work items for project ${project.name}:`, projectError);
        }
      }

      console.log(`Fetched ${allWorkItems.length} work items total`);
      return allWorkItems;

    } catch (error) {
      console.error('Error fetching work items:', error);
      throw new Error(`Failed to execute WIQL query: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getWorkItemsByProject(projectName: string): Promise<AzureWorkItem[]> {
    try {
      const wiqlQuery = {
        query: `
          SELECT [System.Id]
          FROM WorkItems 
          WHERE [System.TeamProject] = '${projectName}'
          ORDER BY [System.ChangedDate] DESC
        `
      };

      const wiqlResponse = await fetch(
        `${this.baseUrl}/wit/wiql?api-version=7.0`,
        {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify(wiqlQuery)
        }
      );

      if (!wiqlResponse.ok) {
        throw new Error(`Failed to execute WIQL query: ${wiqlResponse.status} ${wiqlResponse.statusText}`);
      }

      const wiqlData = await wiqlResponse.json();
      const workItemIds = wiqlData.workItems?.map((wi: any) => wi.id) || [];

      if (workItemIds.length === 0) {
        return [];
      }

      // Fetch work item details
      const idsParam = workItemIds.join(',');
      const detailsResponse = await fetch(
        `${this.baseUrl}/wit/workitems?ids=${idsParam}&api-version=7.0&$expand=fields`,
        {
          headers: this.headers
        }
      );

      if (!detailsResponse.ok) {
        throw new Error(`Failed to fetch work item details: ${detailsResponse.status} ${detailsResponse.statusText}`);
      }

      const detailsData = await detailsResponse.json();
      return detailsData.value || [];

    } catch (error) {
      console.error(`Error fetching work items for project ${projectName}:`, error);
      throw error;
    }
  }
}