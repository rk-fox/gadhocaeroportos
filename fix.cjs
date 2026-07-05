const fs = require('fs');
let content = fs.readFileSync('src/views/MonitoringView.tsx', 'utf8');

// Add darkMode state
content = content.replace(
  '  const [loading, setLoading] = useState(true);',
  '  const [loading, setLoading] = useState(true);\n  const [darkMode, setDarkMode] = useState(false);'
);

// Replace header section to include toggle
const headerStr = '<h2 className="text-3xl font-display font-extrabold text-oklch tracking-tight">\n            Painel Gerencial de Monitoramento\n          </h2>';
const headerReplace = headerStr + '\n          <button onClick={() => setDarkMode(!darkMode)} className={`mt-2 text-xs font-bold px-3 py-1.5 rounded-lg border ${darkMode ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-300 text-slate-600 hover:bg-slate-100"}`}>Modo Noturno: {darkMode ? "ON" : "OFF"}</button>';
content = content.replace(headerStr, headerReplace);

// We need to replace a bunch of dark classes with conditional classes

// Cards and Containers
content = content.replace(
  /className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4"/g,
  'className={`border rounded-2xl p-5 space-y-4 transition-colors ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}'
);

content = content.replace(
  /className="bg-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden"/g,
  'className={`border rounded-2xl p-6 relative overflow-hidden transition-colors ${darkMode ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}'
);

content = content.replace(
  /className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"/g,
  'className={`border rounded-2xl overflow-hidden transition-colors ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}'
);

// Tab Buttons
content = content.replace(
  /'bg-white text-slate-950 shadow'\n                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'/g,
  'darkMode ? "bg-white text-slate-950 shadow" : "bg-slate-800 text-white shadow"\n                  : (darkMode ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800")'
);

// Table background
content = content.replace(
  /className="w-full text-left text-sm text-slate-300"/g,
  'className={`w-full text-left text-sm ${darkMode ? "text-slate-300" : "text-slate-600"}`}'
);

content = content.replace(
  /className="bg-slate-950 border-b border-slate-800"/g,
  'className={`border-b transition-colors ${darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}'
);

content = content.replace(
  /className="hover:bg-slate-800\/50 transition-colors border-b border-slate-800\/50"/g,
  'className={`transition-colors border-b ${darkMode ? "hover:bg-slate-800/50 border-slate-800/50" : "hover:bg-slate-50 border-slate-200"}`}'
);

content = content.replace(
  /className="text-white font-medium"/g,
  'className={`font-medium ${darkMode ? "text-white" : "text-slate-900"}`}'
);

content = content.replace(
  /className="text-slate-400 mt-1 line-clamp-1"/g,
  'className={`mt-1 line-clamp-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}'
);

fs.writeFileSync('src/views/MonitoringView.tsx', content);
console.log('Done');
