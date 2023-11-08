// Common properties for entities with relations
export interface IBaseRelationsEntityModel {
  relations?: string[]; // List of related entities
}

// Common properties for soft delete entities
export interface IBaseSoftDeleteEntityModel {
  deletedAt?: Date; // Indicates if the record is soft deleted
}

// Common properties for entities
export interface IBaseEntityModel extends IBaseSoftDeleteEntityModel {
  id?: string; // Unique identifier

  readonly createdAt?: Date; // Date when the record was created
  readonly updatedAt?: Date; // Date when the record was last updated

  isActive?: boolean; // Indicates if the record is currently active
  isArchived?: boolean; // Indicates if the record is archived
}
