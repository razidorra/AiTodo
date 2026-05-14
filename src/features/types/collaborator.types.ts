export type Collaborator = {
  id: string;
  ownerEmail: string;
  email: string;
  username: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateCollaboratorInput = {
  email: string;
  username: string;
};
