import { Metadata } from "next";
import Image from "next/image";
import { UserNav } from "@/components/user-nav";
import { z } from "zod";
import { DataTable, Credential } from "@/components/DataTable";

export const metadata: Metadata = {
  title: "Credential Dashboard",
  description: "Credential submission statistics and monitoring dashboard",
};

// Define the credential schema
const credentialSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  attempts: z.number(),
  createdAt: z.string(),
  status: z.enum(["new", "pending", "potential_low", "potential_high"]),
});
const mockData: Credential[]=[
    {
      "id": "cred1",
      "email": "user1@example.com",
      "attempts": 3,
      "createdAt": "2023-01-15T12:00:00Z",
      "status": "new"
    },
    {
      "id": "cred2",
      "email": "user2@example.com",
      "attempts": 5,
      "createdAt": "2023-01-16T14:30:00Z",
      "status": "pending"
    },
    {
      "id": "cred3",
      "email": "user3@example.com",
      "attempts": 2,
      "createdAt": "2023-01-17T09:15:00Z",
      "status": "potential_low"
    },
    {
      "id": "cred4",
      "email": "user4@example.com",
      "attempts": 7,
      "createdAt": "2023-01-18T11:45:00Z",
      "status": "potential_high"
    },
    {
      "id": "cred5",
      "email": "user5@example.com",
      "attempts": 1,
      "createdAt": "2023-01-19T08:30:00Z",
      "status": "new"
    },
    {
      "id": "cred6",
      "email": "user6@example.com",
      "attempts": 4,
      "createdAt": "2023-01-20T10:00:00Z",
      "status": "pending"
    },
    {
      "id": "cred7",
      "email": "user7@example.com",
      "attempts": 6,
      "createdAt": "2023-01-21T15:20:00Z",
      "status": "potential_low"
    },
    {
      "id": "cred8",
      "email": "user8@example.com",
      "attempts": 8,
      "createdAt": "2023-01-22T13:10:00Z",
      "status": "potential_high"
    }
  ]
async function getCredentialStats(): Promise<{
  total: number;
  byStatus: Record<string, number>;
  recentSubmissions: Credential[];
  averageAttempts: number;
}> {
const data = mockData;
const validatedData = mockData.map((data) => {
    try {
      return credentialSchema.parse(data); 
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation Errors for data:", data, error.errors);
        return null;
      }
      throw error; 
    }
  }).filter(Boolean);
  return {
    total: validatedData.length,
    byStatus: {
      new: data.filter((d) => d.status === "new").length,
      pending: data.filter((d) => d.status === "pending").length,
      potential_low: data.filter((d) => d.status === "potential_low").length,
      potential_high: data.filter((d) => d.status === "potential_high").length,
    },
    recentSubmissions: data.slice(-10),
    averageAttempts: validatedData.length
      ? data.reduce((acc, curr) => acc + curr.attempts, 0) / validatedData.length
      : 0,
  };
}

export default async function DashboardPage() {
  const stats = await getCredentialStats();

  return (
    <>
      <div className="md:hidden">
        <Image
          src="/logo.png"
          width={1280}
          height={998}
          alt="Playground"
          className="block dark:hidden"
        />
        <Image
          src="/logo.png"
          width={1280}
          height={998}
          alt="Playground"
          className="hidden dark:block"
        />
      </div>
      <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
            <p className="text-muted-foreground">
              Here&apos;s a list of your tasks for this month!
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <UserNav />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Credential Dashboard</h1>
        <div className="mt-4">
          <h2 className="text-xl">Statistics</h2>
          <ul>
            <li>Total Credentials: {stats.total}</li>
            <li>Average Attempts: {stats.averageAttempts.toFixed(2)}</li>
            <li>New: {stats.byStatus.new}</li>
            <li>Pending: {stats.byStatus.pending}</li>
            <li>Potential Low: {stats.byStatus.potential_low}</li>
            <li>Potential High: {stats.byStatus.potential_high}</li>
          </ul>
        </div>
        <div className="mt-4">
          <h2 className="text-xl">Recent Submissions</h2>
          <DataTable data={stats.recentSubmissions} />
        </div>
      </div>
    </>
  );
}
