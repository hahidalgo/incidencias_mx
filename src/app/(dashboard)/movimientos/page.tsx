import prisma from "@/prisma/client";
import { MovimientosClient } from "./components/movimientos-client";
import { MovementColumn } from "./components/columns";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const MovimientosPage = async () => {
    const movements = await prisma.movements.findMany({
        select: {
            id: true,
            incidence_date: true, // Corregido: 'date' a 'incidence_date'
            employee: {
                select: {
                    employee_name: true,
                    employee_code: true,
                    employee_type: true,
                }
            },
            incident: {
                select: {
                    incident_code: true,
                    incident_name: true,
                },
            },
        },
        orderBy: {
            created_at: "desc", // Corregido: 'createdAt' a 'created_at'
        },
    });

    const formattedMovements: MovementColumn[] = movements.map((item) => ({
        id: item.id,
        // Se añaden los nuevos campos al objeto formateado
        employeeCode: item.employee.employee_code,
        employeeType: item.employee.employee_type,
        employeeName: item.employee.employee_name,
        incidentCode: item.incident.incident_code,
        incidentName: item.incident.incident_name,
        // Corregido: Se usa el campo `incidence_date` para el formato.
        date: format(item.incidence_date, "d 'de' MMMM 'de' yyyy", { locale: es }),
    }));

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <MovimientosClient data={formattedMovements} />
            </div>
        </div>
    );
};

export default MovimientosPage;