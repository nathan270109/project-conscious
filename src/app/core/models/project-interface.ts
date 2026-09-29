export interface ProjectInterface {

    id: string;
    name: string;
    repositoryUrl: string;
    description: string;
    createdAt: Date;

}

export type ProjectDraft = Pick<ProjectInterface, 'name' | 'repositoryUrl' | 'description'>;
