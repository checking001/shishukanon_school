import React from 'react';
import SalaryForm from '../components/SalaryForm.jsx';

export default function EmployeeSalary() {
  return (
    <section className="page active">
      <SalaryForm
        type="employee"
        title="কর্মচারীর বেতন — বেতন গ্রহণ রশিদ"
        subtitle="শুধু কর্মচারীর বেতন"
        idPlaceholder="EMP-..."
      />
    </section>
  );
}
