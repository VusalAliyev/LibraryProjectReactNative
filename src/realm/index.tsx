import React, { PropsWithChildren } from "react";
import { RealmProvider as Provider } from "@realm/react";
import { UserSchema, BookSchema, BorrowRequestSchema } from "./schemas";

export function RealmProvider({ children }: PropsWithChildren) {
  return (
    <Provider
      schema={[UserSchema, BookSchema, BorrowRequestSchema]}
      schemaVersion={1}
      path="library-app.realm"
      deleteRealmIfMigrationNeeded={true}
    >
      {children}
    </Provider>
  );
}
