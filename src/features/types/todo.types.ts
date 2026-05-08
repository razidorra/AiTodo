export type Todo = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateTodoInput = {
  title: string;
  description: string;
};

export type UpdateTodoInput = Partial<Pick<Todo, "title" | "description" | "completed">>;
