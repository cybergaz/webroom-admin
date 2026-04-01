import { getAttendance } from "@/app/actions/attendance";
import { AttendanceTable } from "@/components/org/attendance-table";

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const today = new Date().toISOString().slice(0, 10);
  const date = params.date || today;
  const search = params.search || undefined;
  const page = parseInt(params.page ?? "1", 10);

  const result = await getAttendance({ date, search, page, limit: 20 });
  const totalPages = Math.ceil(result.total / result.limit) || 1;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Attendance</h1>
      <AttendanceTable
        attendance={result.data}
        date={date}
        currentPage={page}
        totalPages={totalPages}
        presentCount={result.data.filter((a) => a.present).length}
        totalCount={result.total}
      />
    </div>
  );
}
