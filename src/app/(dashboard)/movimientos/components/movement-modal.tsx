"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Movement } from "./movimientos-client";

// Tipos para los datos que se cargarán en los selectores
interface Employee {
    id: string;
    employee_name: string;
    employee_code: number;
}

interface Incident {
    id: string;
    incident_name: string;
    incident_code: string;
}

interface MovementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData: Movement | null;
}

const formSchema = z.object({
    employeeId: z.string({ required_error: "El empleado es requerido." }).min(1, "El empleado es requerido."),
    incidentId: z.string({ required_error: "La incidencia es requerida." }).min(1, "La incidencia es requerida."),
    incidenceDate: z.date({ required_error: "La fecha de incidencia es requerida." }),
});

type MovementFormValues = z.infer<typeof formSchema>;

export const MovementModal: React.FC<MovementModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    initialData,
}) => {
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [employeePopoverOpen, setEmployeePopoverOpen] = useState(false);
    const [incidentPopoverOpen, setIncidentPopoverOpen] = useState(false);

    const title = initialData ? "Editar Movimiento" : "Crear Movimiento";
    const action = initialData ? "Guardar cambios" : "Crear";

    const form = useForm<MovementFormValues>({
        resolver: zodResolver(formSchema),
    });

    useEffect(() => {
        if (initialData) {
            form.reset({
                employeeId: initialData.employee.id,
                incidentId: initialData.incident.id,
                incidenceDate: new Date(initialData.incidence_date),
            });
        } else {
            form.reset({
                employeeId: '',
                incidentId: '',
                incidenceDate: new Date(),
            });
        }
    }, [initialData, form, isOpen]);

    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                try {
                    const [empRes, incRes] = await Promise.all([
                        fetch('/api/employees?pageSize=1000'),
                        fetch('/api/incidents?pageSize=1000')
                    ]);

                    if (!empRes.ok || !incRes.ok) throw new Error('Error al cargar datos para el formulario.');

                    const empData = await empRes.json();
                    const incData = await incRes.json();

                    setEmployees(empData.employees || []);
                    setIncidents(incData.incidents || []);
                } catch (error: any) {
                    toast.error(error.message);
                }
            };
            fetchData();
        }
    }, [isOpen]);

    const onSubmit = async (values: MovementFormValues) => {
        setLoading(true);
        try {
            const url = initialData ? `/api/movements?id=${initialData.id}` : '/api/movements';
            const method = initialData ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Algo salió mal.');
            }

            toast.success(initialData ? 'Movimiento actualizado.' : 'Movimiento creado.');
            onSuccess();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (loading) return;
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="employeeId"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Empleado</FormLabel>
                                    <Popover open={employeePopoverOpen} onOpenChange={setEmployeePopoverOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                                                    {field.value ? employees.find((e) => e.id === field.value)?.employee_name : "Seleccionar empleado"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                            <Command><CommandInput placeholder="Buscar empleado..." /><CommandList><CommandEmpty>No se encontró el empleado.</CommandEmpty><CommandGroup>
                                                {employees.map((employee) => (<CommandItem value={employee.employee_name} key={employee.id} onSelect={() => { form.setValue("employeeId", employee.id); setEmployeePopoverOpen(false); }}>
                                                    <Check className={cn("mr-2 h-4 w-4", employee.id === field.value ? "opacity-100" : "opacity-0")} />
                                                    {employee.employee_code} - {employee.employee_name}
                                                </CommandItem>))}</CommandGroup></CommandList></Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="incidentId"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Incidencia</FormLabel>
                                    <Popover open={incidentPopoverOpen} onOpenChange={setIncidentPopoverOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                                                    {field.value ? incidents.find((i) => i.id === field.value)?.incident_name : "Seleccionar incidencia"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                            <Command><CommandInput placeholder="Buscar incidencia..." /><CommandList><CommandEmpty>No se encontró la incidencia.</CommandEmpty><CommandGroup>
                                                {incidents.map((incident) => (<CommandItem value={incident.incident_name} key={incident.id} onSelect={() => { form.setValue("incidentId", incident.id); setIncidentPopoverOpen(false); }}>
                                                    <Check className={cn("mr-2 h-4 w-4", incident.id === field.value ? "opacity-100" : "opacity-0")} />
                                                    {incident.incident_code} - {incident.incident_name}
                                                </CommandItem>))}</CommandGroup></CommandList></Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="incidenceDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Fecha de Incidencia</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                    {field.value ? (format(field.value, "PPP", { locale: es })) : (<span>Elige una fecha</span>)}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus locale={es} />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {action}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};