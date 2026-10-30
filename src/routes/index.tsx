import {
  createBrowserRouter,
  Navigate,
  type RouteObject,
} from "react-router-dom";
import { RouteNotFound } from "../components/RouteNotFound";
import { AccountsPage } from "../features/accounts";
import { AuthGuard, GuestGuard, LoginPage } from "../features/auth";
import { CategoriesPage } from "../features/categories";
import { ExpenseTransactionsPage } from "../features/expense-transactions";
import { TransfersPage } from "../features/transfers";
import { AppLayout } from "../layouts/AppLayout";

const routes: RouteObject[] = [
  {
    path: "/login",
    element: (
      <GuestGuard>
        <LoginPage />
      </GuestGuard>
    ),
  },
  {
    element: <AuthGuard />,
    children: [
      {
        path: "/",
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/account" replace /> },
          { path: "account", element: <AccountsPage /> },
          { path: "categories", element: <CategoriesPage /> },
          { path: "transactions", element: <ExpenseTransactionsPage /> },
          { path: "transfers", element: <TransfersPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <RouteNotFound /> },
];

export const router = createBrowserRouter(routes);
