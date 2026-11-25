export type ERPModule={id:string;label:string;description:string;enabled:boolean;group:string;icon:string};
// Toggle modules here to adjust the ERP navigation and module roadmap without rewriting dashboard layout.
export const modules:ERPModule[]=[
{id:"dashboard",label:"Overview",description:"Operational and analytical overview",enabled:true,group:"Core",icon:"◫"},
{id:"procurement",label:"Procurement",description:"Supplier purchases, rates and weighment",enabled:true,group:"Operations",icon:"⇩"},
{id:"inventory",label:"Inventory",description:"Stock ledger, lots, reservations and warehouses",enabled:true,group:"Operations",icon:"▦"},
{id:"sorting",label:"Sorting & Quality",description:"Sorting yields, quality and lot transformations",enabled:true,group:"Operations",icon:"◈"},
{id:"sales",label:"Sales",description:"Orders, allocations and dispatch",enabled:true,group:"Commercial",icon:"⇧"},
{id:"suppliers",label:"Suppliers",description:"Supplier profiles and performance",enabled:true,group:"Commercial",icon:"♧"},
{id:"buyers",label:"Buyers",description:"Buyer profiles, terms and order history",enabled:true,group:"Commercial",icon:"♙"},
{id:"finance",label:"Finance",description:"Payables, receivables and settlement",enabled:false,group:"Finance",icon:"₹"},
{id:"analytics",label:"Analytics",description:"KPIs, profitability and operational reporting",enabled:true,group:"Insights",icon:"⌁"},
{id:"settings",label:"Settings",description:"Configuration and module controls",enabled:true,group:"System",icon:"⚙"}];
