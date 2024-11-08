"use client";

import React, { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  Row,
  Table as ReactTable,
} from "@tanstack/react-table";
import { ChevronDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface ICredential {
  _id?: string;
  email: string;
  passwords: string[];
  createdAt: string;
  status: string;
}

const columns: ColumnDef<ICredential>[] = [
  {
    accessorKey: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllRowsSelected()}
        onCheckedChange={(isChecked) =>
          table.getRowModel().rows.forEach((row) => row.toggleSelected(!!isChecked))
        }
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={() => row.toggleSelected()}
      />
    ),
  },
  {
    accessorKey: "_id",
    header: "ID",
    cell: ({ row }) => <div>{row.index + 1}</div>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="flex items-center space-x-2"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <span>Email</span>
        <ChevronDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "passwords",
    header: "Passwords",
    cell: ({ row }) => <div>{(row.getValue("passwords") as string[]).join(", ")}</div>,
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => (
      <div>{new Date(row.getValue("createdAt")).toLocaleString()}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="font-medium capitalize">{row.getValue("status") as string}</div>
    ),
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => <RowActions row={row} />,
  },
];

interface RowActionsProps {
  row: Row<ICredential>;
}

const RowActions: React.FC<RowActionsProps> = ({ row }) => {
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [email, setEmail] = useState<string>(row.getValue("email") as string);
  const [passwords, setPasswords] = useState<string[]>(row.getValue("passwords") as string[]);

  const handleEdit = () => {
    console.log("Updated Email:", email, "Passwords:", passwords);
    setEditDialogOpen(false);
  };

  const handleDelete = () => console.log("Deleted credential with email:", email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="p-1">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>Edit</DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete}>Delete</DropdownMenuItem>
      </DropdownMenuContent>

      <AlertDialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Credential</AlertDialogTitle>
            <AlertDialogDescription>Update the email and passwords.</AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="mb-2"
          />
          {passwords.map((password, index) => (
            <Input
              key={index}
              value={password}
              onChange={(e) => {
                const newPasswords = [...passwords];
                newPasswords[index] = e.target.value;
                setPasswords(newPasswords);
              }}
              placeholder={`Password ${index + 1}`}
              className="mb-2"
            />
          ))}
          <Button onClick={() => setPasswords([...passwords, ""])}>Add Password</Button>
          <div className="flex justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleEdit}>Save</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </DropdownMenu>
  );
};

interface DataTableProps {
  data: ICredential[];
}

export const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable<ICredential>({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, columnFilters },
  });

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter emails..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(e) => table.getColumn("email")?.setFilterValue(e.target.value)}
          className="max-w-sm w-full"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-sm font-semibold">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <PaginationButton
          label="Previous"
          onClick={table.previousPage}
          disabled={!table.getCanPreviousPage()}
        />
        <PaginationButton
          label="Next"
          onClick={table.nextPage}
          disabled={!table.getCanNextPage()}
        />
      </div>
      <div className="flex items-center justify-between py-4">
        <span>
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <PageSizeSelector table={table} />
      </div>
    </div>
  );
};

interface PaginationButtonProps {
  label: string;
  onClick: () => void;
  disabled: boolean;
}

const PaginationButton: React.FC<PaginationButtonProps> = ({ label, onClick, disabled }) => (
  <Button variant="outline" size="sm" onClick={onClick} disabled={disabled} className="flex-1">
    {label}
  </Button>
);

interface PageSizeSelectorProps {
  table: ReactTable<ICredential>;
}

const PageSizeSelector: React.FC<PageSizeSelectorProps> = ({ table }) => (
  <div className="flex items-center space-x-2">
    {[10, 25, 50, 100].map((size) => (
      <Button
        key={size}
        variant="outline"
        size="sm"
        onClick={() => table.setPageSize(size)}
        disabled={table.getState().pagination.pageSize === size}
      >
        {size}
      </Button>
    ))}
  </div>
);
  