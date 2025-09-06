let orderItemCount = 0;

// === KONFIGURASI CLOUDINARY ===
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dqnrkfjau/upload";
const CLOUDINARY_UPLOAD_PRESET = "clovertees_unsigned";

async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(CLOUDINARY_URL, { method: "POST", body: formData });
  const data = await response.json();
  console.log("Cloudinary response:", data);

  if (!response.ok) throw new Error("Upload gagal ke Cloudinary: " + response.status);
  if (!data.secure_url) throw new Error("Cloudinary tidak mengembalikan secure_url");
  return data.secure_url;
}

// Warna berdasarkan jenis pakaian
const colorOptions = {
  kaos: ["BLACK","WHITE","SOFT PINK","NEON PINK","RED","MAROON","LILAC","SKY BLUE","ROYAL BLUE","NAVY BLUE","NEON YELLOW","TOSCA","GREEN","FOREST GREEN","YELLOW","ORANGE","MUSTARD"],
  dress: ["BLACK","WHITE","RED","YELLOW"],
  kaos_panjang: ["BLACK","WHITE","SOFT PINK","RED","MAROON","SKY BLUE","ROYAL BLUE","NAVY BLUE","NEON YELLOW","TOSCA","GREEN","FOREST GREEN","YELLOW","MUSTARD"]
};
// Mapping warna ke kode hex
const colorHexMap = {
  "BLACK":"#000000","WHITE":"#ffffff","SOFT PINK":"#f8c6d0","NEON PINK":"#ff69b4","RED":"#dc143c",
  "MAROON":"#800000","LILAC":"#c8a2c8","SKY BLUE":"#87ceeb","ROYAL BLUE":"#154df5","NAVY BLUE":"#130152",
  "NEON YELLOW":"#bbff00","TOSCA":"#40e0d0","GREEN":"#008000","FOREST GREEN":"#053a05","YELLOW":"#ffff00",
  "ORANGE":"#ffa500","MUSTARD":"#ffd027"
};
// Ukuran berdasarkan jenis pakaian
const sizeOptions = {
  kaos:{dewasa:["XS","S","M","L","XL","2XL","3XL"], anak:["XS","S","M","L","XL"]},
  dress:{dewasa:["S","M","L"], anak:["S","M","L","XL"]},
  kaos_panjang:{dewasa:["XS","S","M","L","XL","2XL","3XL"], anak:["XS","S","M","L","XL"]}
};
// Nama jenis pakaian
const jenisNames = {kaos:"Kaos", dress:"Dress", kaos_panjang:"Kaos Lengan Panjang"};

// --- INTEGRASI GOOGLE SHEETS ---
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz4OdhrFcHarRDnprQCgKOMSJkjuTRvaLHIN2aNXwA-n9oT-_nS8FtbjzGMcy58tUdJ/exec";
// --- END ---

// === POPUP ===
function showPopupConfirm(summaryHtml, onConfirm) {
  const popup = document.createElement("div");
  popup.className = "popup-overlay";
  popup.innerHTML = `
    <div class="popup">
      <h3>Konfirmasi Pesanan</h3>
      <div class="popup-content">${summaryHtml}</div>
      <div class="popup-actions">
        <button id="confirm-ok">Sudah Pas</button>
        <button id="confirm-cancel">Belum</button>
      </div>
    </div>`;
  document.body.appendChild(popup);

  popup.querySelector("#confirm-ok").onclick = () => { popup.remove(); onConfirm(); };
  popup.querySelector("#confirm-cancel").onclick = () => popup.remove();
}
function showPopupLoading() {
  const popup = document.createElement("div");
  popup.className = "popup-overlay loading";
  popup.innerHTML = `<div class="popup"><h3>⏳ Sedang mengirim pesanan...</h3><p>Harap tunggu, jangan menutup halaman ini.</p></div>`;
  document.body.appendChild(popup);
}
function hidePopupLoading() {
  const popup = document.querySelector(".popup-overlay.loading");
  if (popup) popup.remove();
}

// === TEMPLATE ITEM PESANAN ===
function getOrderItemTemplate(index) {
  return `
  <div class="order-item" data-index="${index}">
    <button type="button" class="remove-item" onclick="removeOrderItem(${index})">×</button>
    <div class="item-header"><h3>Item Pesanan #${index+1}</h3></div>
    <div class="form-group">
      <label>Jenis Pakaian *</label>
      <div class="clothing-type">
        <div class="type-option" data-type="kaos" data-index="${index}"><div>👕</div><div>Kaos</div></div>
        <div class="type-option" data-type="dress" data-index="${index}"><div>👗</div><div>Dress</div></div>
        <div class="type-option" data-type="kaos_panjang" data-index="${index}"><div>👚</div><div>Kaos Lengan Panjang</div></div>
      </div>
      <input type="hidden" name="item_${index}_jenis" required>
    </div>
    <div class="form-group">
      <label>Warna *</label>
      <div class="custom-select">
        <div class="select-trigger"><span>Pilih Warna</span></div>
        <div class="select-options" id="color_options_${index}"></div>
      </div>
      <input type="hidden" name="item_${index}_warna" required>
    </div>
    <div class="item-details">
      <div class="size-section"><h3>Ukuran Dewasa</h3><div class="size-grid" id="dewasa_sizes_${index}"></div></div>
      <div class="size-section"><h3>Ukuran Anak-anak</h3><div class="size-grid" id="anak_sizes_${index}"></div></div>
    </div>
    <div class="design-section">
      ${["depan","belakang","lengan"].map(type=>`
      <div class="design-box">
        <h4>Desain ${type}</h4>
        <textarea name="item_${index}_desain_${type}" rows="3"></textarea>
        <div class="design-files" id="files_${type}_${index}">
          <div class="file-upload-section">
            <h4>File Desain ${type}</h4>
            <div id="file_inputs_${type}_${index}">
              <div class="file-input-container">
                <input type="file" name="item_${index}_file_${type}_0" accept=".jpg,.jpeg,.png,.pdf,.ai,.psd">
                <button type="button" class="remove-file" onclick="removeFileInput('${type}',${index},0)">Hapus</button>
              </div>
            </div>
            <button type="button" class="add-file-btn" onclick="addFileInput('${type}',${index})">+ Tambah File</button>
          </div>
        </div>
      </div>`).join("")}
    </div>
  </div>`;
}

// === FILE INPUT + CLOUDINARY ===
function attachUploadListener(fileInput, type, itemIndex, fileIndex) {
  fileInput.addEventListener("change", async function () {
    const files = Array.from(this.files);
    if (!files.length) return;
    const hiddenName = `item_${itemIndex}_file_${type}_links`;
    let hiddenInput = document.querySelector(`input[name="${hiddenName}"]`);
    if (!hiddenInput) {
      hiddenInput = document.createElement("input");
      hiddenInput.type = "hidden";
      hiddenInput.name = hiddenName;
      hiddenInput.value = "";
      document.getElementById("orderForm").appendChild(hiddenInput);
    }
    for (const file of files) {
      try {
        const url = await uploadToCloudinary(file);
        hiddenInput.value = hiddenInput.value ? hiddenInput.value+", "+url : url;
      } catch(err) { alert("Gagal upload ke Cloudinary: "+err.message); }
    }
  });
}
function addFileInput(type,itemIndex){
  const container=document.getElementById(`file_inputs_${type}_${itemIndex}`);
  const fileCount=container.querySelectorAll('input[type="file"]').length;
  const div=document.createElement('div');
  div.className='file-input-container';
  div.innerHTML=`<input type="file" name="item_${itemIndex}_file_${type}_${fileCount}" accept=".jpg,.jpeg,.png,.pdf,.ai,.psd"><button type="button" class="remove-file" onclick="removeFileInput('${type}',${itemIndex},${fileCount})">Hapus</button>`;
  const input=div.querySelector('input[type="file"]');
  attachUploadListener(input,type,itemIndex,fileCount);
  container.appendChild(div);
}
function removeFileInput(type,itemIndex,fileIndex){
  const c=document.getElementById(`file_inputs_${type}_${itemIndex}`);
  c.querySelector(`input[name="item_${itemIndex}_file_${type}_${fileIndex}"]`)?.parentElement.remove();
  const remain=c.querySelectorAll('.file-input-container');
  remain.forEach((cont,i)=>{
    const inp=cont.querySelector('input[type="file"]');
    const btn=cont.querySelector('.remove-file');
    if(inp) inp.name=`item_${itemIndex}_file_${type}_${i}`;
    if(btn) btn.onclick=()=>removeFileInput(type,itemIndex,i);
  });
}

// === OPSI WARNA & UKURAN ===
function updateColorOptions(index,jenis){
  const cont=document.getElementById(`color_options_${index}`); if(!cont) return;
  cont.innerHTML='';
  if(colorOptions[jenis]){
    colorOptions[jenis].forEach(color=>{
      const opt=document.createElement('div');
      opt.className='select-option';
      opt.innerHTML=`<div class="color-swatch" style="background-color:${colorHexMap[color]}"></div><span>${color}</span>`;
      opt.onclick=()=>{
        const trig=document.querySelector(`.order-item[data-index="${index}"] .select-trigger span`);
        trig.textContent=color;
        document.querySelector(`input[name="item_${index}_warna"]`).value=color;
        cont.style.display='none'; updateSummary();
      };
      cont.appendChild(opt);
    });
  }
}
function updateSizeOptions(index,jenis){
  const d=document.getElementById(`dewasa_sizes_${index}`), a=document.getElementById(`anak_sizes_${index}`);
  d.innerHTML=''; a.innerHTML='';
  if(sizeOptions[jenis]){
    sizeOptions[jenis].dewasa.forEach(sz=>d.innerHTML+=`<div class="size-item"><label>${sz}</label><input type="number" name="item_${index}_dewasa_${sz.toLowerCase()}" min="0" value="0"></div>`);
    sizeOptions[jenis].anak.forEach(sz=>a.innerHTML+=`<div class="size-item"><label>${sz}</label><input type="number" name="item_${index}_anak_${sz.toLowerCase()}" min="0" value="0"></div>`);
  }
}

// === TAMBAH ITEM ===
document.getElementById('addOrderItem').addEventListener('click',function(){
  const c=document.getElementById('orderItems'); const div=document.createElement('div');
  div.innerHTML=getOrderItemTemplate(orderItemCount); c.appendChild(div);

  ["depan","belakang","lengan"].forEach(t=>{
    const input=div.querySelector(`input[name="item_${orderItemCount}_file_${t}_0"]`);
    if(input) attachUploadListener(input,t,orderItemCount,0);
  });

  div.querySelectorAll('.type-option').forEach(opt=>{
    opt.onclick=function(){
      const idx=this.dataset.index, jenis=this.dataset.type;
      document.querySelectorAll(`.type-option[data-index="${idx}"]`).forEach(o=>o.classList.remove('selected'));
      this.classList.add('selected');
      document.querySelector(`input[name="item_${idx}_jenis"]`).value=jenis;
      updateColorOptions(idx,jenis); updateSizeOptions(idx,jenis); updateSummary();
    };
  });

  const colorSelect=div.querySelector('.custom-select'), trigger=colorSelect.querySelector('.select-trigger'), optCont=colorSelect.querySelector('.select-options');
  trigger.onclick=()=>optCont.style.display=optCont.style.display==='block'?'none':'block';
  window.addEventListener('click',e=>{if(!colorSelect.contains(e.target)) optCont.style.display='none';});

  orderItemCount++; updateSummary();
});
function removeOrderItem(index){document.querySelector(`.order-item[data-index="${index}"]`)?.remove(); updateSummary();}

// === SUMMARY ===
function formatSizeSummary(s,p){const arr=[];for(const [sz,q]of Object.entries(s)){if(q>0)arr.push(`${sz} ${q}`);}return arr.length?`${p}: ${arr.join(', ')}`:`${p}: -`;}
function updateSummary(){
  let totalItems=0,totalPcs=0; const sumC=document.getElementById('orderSummary');
  document.querySelectorAll('input[type="number"]').forEach(i=>totalPcs+=parseInt(i.value)||0);
  const items=document.querySelectorAll('.order-item'); totalItems=items.length; let html='';
  items.forEach(item=>{
    const idx=item.dataset.index, jenis=document.querySelector(`input[name="item_${idx}_jenis"]`)?.value, warna=document.querySelector(`input[name="item_${idx}_warna"]`)?.value;
    if(jenis&&warna){
      const dew={}, anak={};
      sizeOptions[jenis].dewasa.forEach(sz=>{const v=document.querySelector(`input[name="item_${idx}_dewasa_${sz.toLowerCase()}"]`);if(v&&v.value>0)dew[sz]=v.value;});
      sizeOptions[jenis].anak.forEach(sz=>{const v=document.querySelector(`input[name="item_${idx}_anak_${sz.toLowerCase()}"]`);if(v&&v.value>0)anak[sz]=v.value;});
      html+=`<div class="order-summary-item"><h4>${jenisNames[jenis]}</h4><div class="order-summary-details"><p>${warna}</p><p>${formatSizeSummary(dew,'Dewasa')}</p><p>${formatSizeSummary(anak,'Anak-anak')}</p></div></div>`;
    }
  });
  sumC.innerHTML=html||'<p class="no-data">Belum ada item pesanan</p>';
  document.getElementById('totalItems').textContent=totalItems;
  document.getElementById('totalPcs').textContent=totalPcs;
}
document.addEventListener('input',e=>{if(e.target.type==='number')updateSummary();});

// === SUBMIT FORM ===
document.getElementById("orderForm").addEventListener("submit",async function(e){
  e.preventDefault();
  let valid=true;
  ["nama","whatsapp","alamat"].forEach(f=>{const i=document.getElementById(f);if(!i.value.trim()){i.style.borderColor="red";valid=false;}else i.style.borderColor="#ddd";});
  if(document.querySelectorAll(".order-item").length===0){alert("Minimal 1 item");return;}
  if(!valid){document.getElementById("errorMessage").style.display="block";document.getElementById("errorMessage").textContent="Harap lengkapi semua field wajib.";return;}

  const formData=new FormData(this); const obj={}; for(const [k,v]of formData.entries())obj[k]=v instanceof File?v.name:v;

  let totalPcs=0, sumHtml=`<p><strong>Nama:</strong> ${formData.get("nama")}</p><p><strong>WhatsApp:</strong> ${formData.get("whatsapp")}</p><p><strong>Alamat:</strong> ${formData.get("alamat")}</p><hr>`;
  let i=0;
  while(formData.get(`item_${i}_jenis`)!==null){
    const jenis=formData.get(`item_${i}_jenis`), warna=formData.get(`item_${i}_warna`)||"-";
    const dew=[], anak=[];
    ["xs","s","m","l","xl","2xl","3xl"].forEach(sz=>{const q=parseInt(formData.get(`item_${i}_dewasa_${sz}`)||"0",10);if(q>0){dew.push(`${sz.toUpperCase()} ${q}`);totalPcs+=q;}});
    ["xs","s","m","l","xl"].forEach(sz=>{const q=parseInt(formData.get(`item_${i}_anak_${sz}`)||"0",10);if(q>0){anak.push(`${sz.toUpperCase()} ${q}`);totalPcs+=q;}});
    sumHtml+=`<p><strong>${i+1}. ${jenis.toUpperCase()}</strong><br>${warna}<br>Dewasa: ${dew.length?dew.join(", "):"-"}<br>Anak-anak: ${anak.length?anak.join(", "):"-"}</p><hr>`;
    i++;
  }
  sumHtml+=`<h4 style="text-align:center;">TOTAL: ${totalPcs} PCS</h4>`;

  showPopupConfirm(sumHtml,async()=>{
    showPopupLoading();
    try{
      const res=await fetch(GOOGLE_SCRIPT_URL,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams(obj).toString()});
      const result=await res.json(); hidePopupLoading();
      if(result.result==="success"){
        const no=result.no_pesanan||"-";
        const p=document.createElement("div");p.className="popup-overlay";p.innerHTML=`<div class="popup"><h3>✅ Pesanan Berhasil</h3><p>No. Pesanan anda <strong>#${no}</strong> berhasil dikirim!</p><p>Kami akan mengubungi anda segera.</p><button class="popup-close-btn">Tutup</button></div>`;document.body.appendChild(p);
        p.querySelector(".popup-close-btn").onclick=()=>p.remove();
        this.reset(); document.getElementById("orderItems").innerHTML=""; orderItemCount=0; updateSummary();
      } else alert("Gagal: "+result.message);
    }catch(err){hidePopupLoading();alert("Error: "+err.message);}
  });
});

// === INIT ===
document.addEventListener('DOMContentLoaded',()=>{document.getElementById('addOrderItem').click();});
