export interface Employee {
  id: string
  name: string
  phone?: string
  contractHours: number
}

export interface Shift {
  id: string
  employeeId: string
  startTime: string
  endTime: string
  site?: string
  employee: Employee
}