"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function NewQuotationPage() {

const router = useRouter();

const [checking,setChecking] = useState(true);
const [agentEmail,setAgentEmail] = useState("");

const [clientName,setClientName] = useState("");
const [clientPhone,setClientPhone] = useState("");

const [destination,setDestination] = useState("");
const [travelDate,setTravelDate] = useState("");

const [makkahNights,setMakkahNights] = useState("");
const [madinahNights,setMadinahNights] = useState("");
const [totalNights,setTotalNights] = useState("");

const [visaIncluded,setVisaIncluded] = useState(false);
const [transportIncluded,setTransportIncluded] = useState(false);
const [ziyaratIncluded,setZiyaratIncluded] = useState(false);

const [quotationStatus,setQuotationStatus] = useState("draft");

const [totalPrice,setTotalPrice] = useState("");

const [msg,setMsg] = useState("");

useEffect(()=>{
async function check(){

const {data} = await supabase.auth.getSession();
const session = data?.session;

if(!session?.user?.email){
router.replace("/agent/login");
return;
}

setAgentEmail(session.user.email);
setChecking(false);

}

check();

},[router]);


useEffect(()=>{

const mk = Number(makkahNights || 0);
const md = Number(madinahNights || 0);

if(mk + md > 0){
setTotalNights(String(mk+md));
}

},[makkahNights,madinahNights]);



async function saveQuotation(e){

e.preventDefault();

const payload = {

client_name:clientName,
client_phone:clientPhone,

destination:destination,
travel_date:travelDate,

makkah_nights:makkahNights,
madinah_nights:madinahNights,
total_nights:totalNights,

visa_included:visaIncluded,
transport_included:transportIncluded,
ziyarat_included:ziyaratIncluded,

total_price:totalPrice,

quotation_status:quotationStatus,
created_by:agentEmail

};

const {error} = await supabase
.from("quotations")
.insert([payload]);

if(error){

setMsg("Error saving quotation");

}else{

setMsg("Quotation saved successfully");

}

}


if(checking){

return(

<div style={styles.loading}>
Loading...
</div>

);

}


return(

<div style={styles.page}>

<div style={styles.card}>

<div style={styles.header}>

<div>

<h1 style={styles.title}>
New Client Quotation
</h1>

<p style={styles.subtitle}>
Create Umrah quotation for client
</p>

</div>

<Link href="/agent/dashboard" style={styles.backBtn}>
← Back
</Link>

</div>

{msg && (
<div style={styles.msg}>
{msg}
</div>
)}

<form onSubmit={saveQuotation}>

<div style={styles.row}>

<Field label="Client Name">
<input
style={styles.input}
value={clientName}
onChange={e=>setClientName(e.target.value)}
required
/>
</Field>

<Field label="Client Phone">
<input
style={styles.input}
value={clientPhone}
onChange={e=>setClientPhone(e.target.value)}
required
/>
</Field>

</div>


<div style={styles.row}>

<Field label="Destination">
<input
style={styles.input}
value={destination}
onChange={e=>setDestination(e.target.value)}
placeholder="Makkah / Madinah"
required
/>
</Field>

<Field label="Travel Date">
<input
style={styles.input}
value={travelDate}
onChange={e=>setTravelDate(e.target.value)}
placeholder="2026-03-20"
required
/>
</Field>

</div>


<div style={styles.row}>

<Field label="Makkah Nights">
<input
style={styles.input}
value={makkahNights}
onChange={e=>setMakkahNights(e.target.value)}
/>
</Field>

<Field label="Madinah Nights">
<input
style={styles.input}
value={madinahNights}
onChange={e=>setMadinahNights(e.target.value)}
/>
</Field>

</div>


<div style={styles.row}>

<Field label="Total Nights">
<input
style={styles.input}
value={totalNights}
readOnly
/>
</Field>

<Field label="Quotation Status">

<select
value={quotationStatus}
onChange={e=>setQuotationStatus(e.target.value)}
style={styles.select}
>

<option value="draft">Draft</option>
<option value="sent">Sent</option>
<option value="confirmed">Confirmed</option>

</select>

</Field>

</div>


<div style={styles.checkRow}>

<label style={styles.checkItem}>
<input type="checkbox" checked={visaIncluded} onChange={e=>setVisaIncluded(e.target.checked)} />
Visa Included
</label>

<label style={styles.checkItem}>
<input type="checkbox" checked={transportIncluded} onChange={e=>setTransportIncluded(e.target.checked)} />
Transport Included
</label>

<label style={styles.checkItem}>
<input type="checkbox" checked={ziyaratIncluded} onChange={e=>setZiyaratIncluded(e.target.checked)} />
Ziyarat Included
</label>

</div>


<div style={styles.row}>

<Field label="Total Price">

<input
style={styles.input}
value={totalPrice}
onChange={e=>setTotalPrice(e.target.value)}
required
/>

</Field>

</div>


<button style={styles.saveBtn}>
Save Quotation
</button>

</form>

</div>

</div>

);

}



function Field({label,children}){

return(

<div style={{flex:1}}>

<div style={styles.label}>
{label}
</div>

{children}

</div>

);

}



const styles={

page:{
minHeight:"100vh",
display:"grid",
placeItems:"center",
background:"#070712",
color:"white",
fontFamily:"system-ui"
},

card:{
width:"100%",
maxWidth:"850px",
background:"rgba(255,255,255,0.03)",
border:"1px solid rgba(255,255,255,0.08)",
borderRadius:"16px",
padding:"26px"
},

header:{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
marginBottom:"18px"
},

title:{
margin:0,
fontSize:"26px",
fontWeight:800
},

subtitle:{
opacity:.7,
fontSize:"13px"
},

backBtn:{
color:"white",
textDecoration:"none",
padding:"8px 14px",
borderRadius:"10px",
background:"rgba(255,255,255,.08)"
},

msg:{
background:"rgba(0,200,120,.15)",
padding:"10px",
borderRadius:"10px",
marginBottom:"15px"
},

row:{
display:"flex",
gap:"14px",
marginBottom:"14px"
},

label:{
fontSize:"12px",
marginBottom:"6px",
opacity:.7
},

input:{
width:"100%",
padding:"10px",
borderRadius:"10px",
border:"1px solid rgba(255,255,255,.12)",
background:"rgba(255,255,255,.05)",
color:"white"
},

select:{
width:"100%",
padding:"10px",
borderRadius:"10px",
border:"1px solid rgba(255,255,255,.12)",
background:"#141421",
color:"white",
appearance:"none",
cursor:"pointer"
},

checkRow:{
display:"flex",
gap:"14px",
marginBottom:"18px"
},

checkItem:{
display:"flex",
alignItems:"center",
gap:"6px",
fontSize:"13px"
},

saveBtn:{
width:"100%",
padding:"12px",
borderRadius:"12px",
border:"none",
background:"linear-gradient(90deg,#7b2ff7,#f107a3)",
color:"white",
fontWeight:700,
cursor:"pointer"
},

loading:{
minHeight:"100vh",
display:"grid",
placeItems:"center",
background:"#070712",
color:"white"
}

};
