export class filterAppointmentDto {
    status?: string; // debe ser del enum
    date?: string|Date; // string de la fecha en formato YYYY-MM-DD
    provider?: string;//nombre del proveedor que figura en la appointment
    client?: string;//nombre del cliente que figura en la appointment
    category?: string;//jardineria o limpieza
}