import React from 'react';
import SalaryForm from '../components/SalaryForm.jsx';

export default function TeacherSalary() {
  return (
    <section className="page active">
      <SalaryForm
        type="teacher"
        title="শিক্ষকের বেতন — বেতন গ্রহণ রশিদ"
        subtitle="শুধু শিক্ষক/শিক্ষিকার বেতন"
        idPlaceholder="TC-..."
      />
    </section>
  );
}
