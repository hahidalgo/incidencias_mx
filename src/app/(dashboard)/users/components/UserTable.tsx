import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";
import React from "react";

export type UserTableUser = {
  id: string;
  //company_id: string;
  //office_id: string[]; // Cambiado de officeId: string
  user_name: string;
  user_email: string;
  //user_status: "ACTIVE" | "INACTIVE";
  user_status: 1 | 0;
  user_rol: 1 | 2 | 3;
  user_access: [
    {
      id: string;
      company_id: string;
      office_id: string;
      office_name: string;
      company_name: string;
    },
  ];
};

interface UserTableProps {
  users: UserTableUser[];
  //companyMap: Map<string, string>;
  //officeMap: Map<string, string>;
  loading: boolean;
  onEdit: (userId: string) => void;
  onDelete: (userId: string) => void;
}

const ROLE_LABELS: Record<string, string> = {
  111: "Super Administrador",
  1: "Recursos Humanos de PlayCityl",
  2: "Gerente de zona",
  3: "Administrador de personal",
};

const STATUS_LABELS: Record<string, string> = {
  1: "Activo",
  0: "Inactivo",
};

export const UserTable: React.FC<UserTableProps> = ({
  users,
  //companyMap,
  //officeMap,
  loading,
  onEdit,
  onDelete,
}) => (
  <div className="border rounded-lg">
    <Table>
      <TableHeader>
        <TableRow className="bg-blue-950 text-white hover:bg-blue-800">
          <TableHead className="text-white">Nombre</TableHead>
          <TableHead className="text-white">Email</TableHead>
          <TableHead className="text-white">Empresa</TableHead>
          <TableHead className="text-white">Oficina</TableHead>
          <TableHead className="text-white w-24">Rol</TableHead>
          <TableHead className="text-white w-24">Status</TableHead>
          <TableHead className="w-32 text-white text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center h-24">
              Cargando...
            </TableCell>
          </TableRow>
        ) : users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center h-24">
              No se encontraron usuarios.
            </TableCell>
          </TableRow>
        ) : (
          users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.user_name}</TableCell>
              <TableCell>{user.user_email}</TableCell>
              <TableCell>
                {user.user_access && user.user_access.length > 0
                  ? user.user_access[0].company_id
                  : "N/A"}
              </TableCell>
              <TableCell>
                {user.user_access && user.user_access.length > 0
                  ? user.user_access.map((access) => access.office_name) ||
                    "N/A"
                  : "N/A"}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    /*user.userRol === 'ADMIN' ? 'secondary' :*/ "outline"
                  }
                >
                  {ROLE_LABELS[user.user_rol] ?? `Rol ${user.user_rol}`}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    Number(user.user_status) === 1 ? "default" : "destructive"
                  }
                >
                  {STATUS_LABELS[user.user_status] ??
                    `Estado ${user.user_status}`}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(user.id)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(user.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </div>
);
