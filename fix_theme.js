const fs = require('fs');

let content = fs.readFileSync('src/views/MonitoringView.tsx', 'utf8');

// 1. Re-add state and toggle
if (!content.includes('const [darkMode, setDarkMode]')) {
  content = content.replace(
    '  const [loading, setLoading] = useState(true);',
    '  const [loading, setLoading] = useState(true);\n  const [darkMode, setDarkMode] = useState(false);'
  );
  
  const headerStr = '<h2 className="text-3xl font-display font-extrabold text-oklch tracking-tight">\n            Painel Gerencial de Monitoramento\n          </h2>';
  const headerReplace = headerStr + '\n          <button onClick={() => setDarkMode(!darkMode)} className={`mt-2 text-xs font-bold px-3 py-1.5 rounded-lg border ${darkMode ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-300 text-slate-600 hover:bg-slate-100"}`}>Modo Noturno: {darkMode ? "ON" : "OFF"}</button>';
  content = content.replace(headerStr, headerReplace);
}

// 2. We will use a helper function to wrap class lists
// First, inject the helper function
if (!content.includes('const t = (classes)')) {
  content = content.replace(
    'export default function MonitoringView() {',
    'export default function MonitoringView() {\n  const t = (classes) => {\n    if (darkMode) return classes;\n    return classes\n      .replace(/bg-slate-900/g, "bg-[#f8fafc] shadow-sm")\n      .replace(/bg-slate-950/g, "bg-white")\n      .replace(/bg-slate-800/g, "bg-slate-100")\n      .replace(/bg-slate-850/g, "bg-slate-50")\n      .replace(/border-slate-800/g, "border-slate-200")\n      .replace(/border-slate-700/g, "border-slate-300")\n      .replace(/text-slate-400/g, "text-slate-500")\n      .replace(/text-slate-300/g, "text-slate-700")\n      .replace(/text-slate-500/g, "text-slate-500")\n      .replace(/text-white/g, "text-slate-900")\n      .replace(/text-oklch/g, "text-slate-900");\n  };\n'
  );
}

// 3. Now we replace className="[string]" with className={t("[string]")}
// We only want to do this for JSX tags.
content = content.replace(/className="([^"]+)"/g, 'className={t("$1")}');

// 4. We also need to handle template literals: className={`...`}
// We can wrap them: className={t(`...`)}
// We need to be careful not to double wrap if we already wrapped them.
// Let's just find className={` and replace with className={t(`
content = content.replace(/className=\{`([^`]+)`\}/g, 'className={t(`$1`)}');

// 5. Some conditional classes like: className={selected ? 'bg-white...' : 'text-slate...'}
// It's harder. Let's just wrap the entire expression if it's not already wrapped by t().
// We'll skip complex conditionals for now, or we can just replace the strings in the whole file manually.
// Actually, using `t` everywhere is brilliant. Let's fix DonutChart text colors too!
content = content.replace(/ctx\.fillStyle = '#1e293b';/g, 'ctx.fillStyle = darkMode ? "#1e293b" : "#f1f5f9";');
content = content.replace(/ctx\.fillStyle = '#64748b';/g, 'ctx.fillStyle = darkMode ? "#64748b" : "#64748b";');
content = content.replace(/ctx\.fillStyle = '#f8fafc';/g, 'ctx.fillStyle = darkMode ? "#f8fafc" : "#0f172a";');
content = content.replace(/ctx\.fillStyle = '#94a3b8';/g, 'ctx.fillStyle = darkMode ? "#94a3b8" : "#64748b";');

// Pass darkMode to DonutChart
content = content.replace(/const DonutChart: React\.FC<DonutChartProps> = \(\{ segments, title, size = 180 \}\) => \{/, 'const DonutChart: React.FC<DonutChartProps & {darkMode?: boolean}> = ({ segments, title, size = 180, darkMode }) => {');
content = content.replace(/<DonutChart/g, '<DonutChart darkMode={darkMode}');

fs.writeFileSync('src/views/MonitoringView.tsx', content);
console.log('Fixed MonitoringView');
