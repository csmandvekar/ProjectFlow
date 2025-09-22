import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export function Layout() {
  console.log('Layout rendering');

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}