function cleanInline(s){return s.replace(/\*\*(.+?)\*\*/g,"$1").replace(/\*(.+?)\*/g,"$1").replace(/\s{2,}/g," ").trim()}
function splitTitleAndBody(full){
  if(full.length<80)return null;
  const m=full.match(/^(.{8,60}?)(\s+(?:Upgrade|Discover|Experience|Elevate|Transform|Our|Featuring|These|Crafted|Designed|Perfect|Ideal|Made|Built)\b[\s\S]+)$/i);
  if(m)return{title:m[1].trim(),body:m[2].trim()};
  return null;
}
function parse(raw){
  let text=raw.replace(/\r\n/g,"\n").replace(/\s*(#{1,3})\s+/g,"\n$1 ").replace(/\s+\*\s+/g,"\n* ").trim();
  const lines=text.split("\n").map(l=>l.trim()).filter(Boolean);
  const blocks=[]; let list=[];
  const flush=()=>{if(list.length){blocks.push({type:"list",n:list.length,sample:list.slice(0,2)});list=[]}};
  for(const line of lines){
    const h3=line.match(/^###\s+(.+)$/); if(h3){flush();blocks.push({type:"h3",text:cleanInline(h3[1])});continue}
    const h2=line.match(/^##\s+(.+)$/); if(h2){flush();const full=cleanInline(h2[1]);const sp=splitTitleAndBody(full);if(sp){blocks.push({type:"h2",text:sp.title});if(sp.body)blocks.push({type:"p",len:sp.body.length})}else blocks.push({type:"h2",text:full});continue}
    const b=line.match(/^[\*\-•]\s+(.+)$/); if(b){list.push(cleanInline(b[1]));continue}
    flush(); blocks.push({type:"p",text:cleanInline(line).slice(0,50)});
  }
  flush(); return blocks;
}
const raw="## 18U Phi Microblading Blades Upgrade your PMU artistry with our premium 18U Phi Microblading Blades, specially designed for smooth shading and soft eyebrow filling. Featuring 18 ultra-fine needles arranged in a precise U-shape, these blades deliver clean pigment application, natural-looking results, and exceptional control for professional brow treatments. Crafted from high-quality stainless steel and designed for single use, they ensure maximum hygiene, safety, and precision during every procedure. Perfect for creating soft powder effects, blended shading, and flawless brow enhancements with ease. ### Key Features * 18 ultra-fine needles in U-shape design * Ideal for smooth shading and soft brow filling * Sharp and precise for natural-looking results * Single-use, sterile, and hygienic * Professional-grade quality for PMU artists * Comfortable handling and consistent performance ### Perfect For * Microblading * Ombre Brows * Powder Brows * Soft Shading Techniques * Professional PMU Applications";
console.log(JSON.stringify(parse(raw),null,2));
