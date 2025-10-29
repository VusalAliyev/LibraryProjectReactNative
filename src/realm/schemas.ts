import Realm from "realm";

export const UserSchema: Realm.ObjectSchema = {
  name: "User",
  primaryKey: "_id",
  properties: {
    _id: "objectId",
    email: "string",
    name: "string",
    passwordHash: "string",
    isSU: "bool",
    createdAt: "date"
  }
};

export const BookSchema: Realm.ObjectSchema = {
  name: "Book",
  primaryKey: "_id",
  properties: {
    _id: "objectId",
    title: "string",
    author: "string",
    coverUrl: "string?",
    total: "int",
    available: "int",
    createdAt: "date",
    updatedAt: "date"
  }
};

export const BorrowRequestSchema: Realm.ObjectSchema = {
  name: "BorrowRequest",
  primaryKey: "_id",
  properties: {
    _id: "objectId",
    userId: "objectId",
    bookId: "objectId",
    status: "string", // 'pending' | 'approved' | 'rejected' | 'returned'
    requestedAt: "date",
    decidedAt: "date?",
    dueDate: "date?"
  }
};
