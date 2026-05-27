import React, { useState } from "react";
import UserForm from "../UserForm/UserForm";
import UserList from "../UserList/UserList";
import PageHeader from "../../ui/PageHeader";
import SectionTabs from "../../ui/SectionTabs";

const TABS = [
  { id: "lista", label: "Ver usuarios", icon: "bi-people" },
  { id: "registrar", label: "Registrar usuario", icon: "bi-person-plus" },
];

export default function Usuarios() {
  const [tab, setTab] = useState("lista");

  return (
    <div className="container">
      <PageHeader
        title="Usuarios"
        subtitle="Administra las personas que participan de tus finanzas."
      />
      <SectionTabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === "lista" && <UserList />}
      {tab === "registrar" && <UserForm />}
    </div>
  );
}
