"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import { Period } from "./periods-client";

const formSchema = z.object({
    periodName: z.string().min(1, "El nombre del periodo es requerido."),
    periodStart: z.date({ required_error: "La fecha de inicio es requerida." }),
    periodEnd: z.date({ required_error: "La fecha de fin es requerida." }),
    periodStatus: z.enum(["ACTIVE", "INACTIVE"], { required_error: "El estado es requerido." }),
});

type PeriodFormValues = z.infer<typeof formSchema>;

interface PeriodModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData: Period | null;
}

export const PeriodModal: React.FC<PeriodModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    initialData,
}) => {
    const [loading, setLoading] = useState(false);
    const title = initialData ? "Editar Periodo" : "Crear Periodo";
    const action = initialData ? "Guardar cambios" : "Crear";

    const form = useForm<PeriodFormValues>({
        resolver: zodResolver(formSchema),
    });

    useEffect(() => {
        if (initialData) {
            form.reset({
                periodName: initialData.periodName,
                periodStart: new Date(initialData.periodStart),
                periodEnd: new Date(initialData.periodEnd),
                periodStatus: initialData.periodStatus,
            });
        } else {
            form.reset({
                periodName: '',
                periodStart: new Date(),
                periodEnd: new Date(),
                periodStatus: 'ACTIVE',
            });
        }
    }, [initialData, form, isOpen]);

    const onSubmit = async (values: PeriodFormValues) => {
        setLoading(true);
        try {
            const body = {
                period_name: values.periodName,
                period_start: values.periodStart,
                period_end: values.periodEnd,
                period_status: values.periodStatus,
            };
            const url = initialData ? `/api/periods` : '/api/periods';
            const method = initialData ? 'PUT' : 'POST';
            const reqBody = initialData ? { ...body, id: initialData.id } : body;
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reqBody),
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Algo salió mal.');
            }
            toast.success(initialData ? 'Periodo actualizado.' : 'Periodo creado.');
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
                            name="periodName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre del Periodo</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder="Nombre del periodo" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex gap-4">
                            <FormField
                                control={form.control}
                                name="periodStart"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Fecha de Inicio</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                        disabled={loading}
                                                    >
                                                        {field.value ? format(field.value, "d 'de' MMMM 'de' yyyy", { locale: es }) : <span>Selecciona una fecha</span>}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={loading}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="periodEnd"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Fecha de Fin</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                        disabled={loading}
                                                    >
                                                        {field.value ? format(field.value, "d 'de' MMMM 'de' yyyy", { locale: es }) : <span>Selecciona una fecha</span>}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={loading}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="periodStatus"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Estado</FormLabel>
                                    <FormControl>
                                        <select {...field} disabled={loading} className="w-full border rounded px-2 py-2">
                                            <option value="ACTIVE">Activo</option>
                                            <option value="INACTIVE">Inactivo</option>
                                        </select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={loading}>
                                {action}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}; 