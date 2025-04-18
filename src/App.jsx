import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { Textarea } from './components/ui/textarea';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { DownloadIcon, ClipboardIcon } from 'lucide-react';

const categories = ["crypto", "forensics", "misc", "osint", "pwn", "re", "web"];
const difficulties = ["easy", "medium", "hard", "insane"];

export default function LNCConfigGenerator() {
  const [form, setForm] = useState({
    name: '',
    author: '',
    category: 'misc',
    difficulty: 'easy',
    description: '',
    discord: '',
    flag: '',
    port: '',
    hints: [],
    requirements: []
  });

  const [files, setFiles] = useState([]);
  const [fileInput, setFileInput] = useState('');
  const [editingFileIdx, setEditingFileIdx] = useState(null);

  const [hintText, setHintText] = useState('');
  const [hintCost, setHintCost] = useState('');
  const [editingHintIdx, setEditingHintIdx] = useState(null);

  const [flagValid, setFlagValid] = useState(true);
  const [hintError, setHintError] = useState('');
  const [portError, setPortError] = useState('');
  const [copied, setCopied] = useState('');

  const [activeTab, setActiveTab] = useState('json');

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };

    if (name === 'flag') {
      setFlagValid(/^LNC25\{.*\}$/.test(value));
    }
    if (name === 'port') {
      if (value && (!/^\d+$/.test(value) || +value < 1 || +value > 65535)) {
        setPortError('Port must be a number between 1 and 65535');
      } else {
        setPortError('');
      }
    }
    setForm(updated);
  };

  // Hints CRUD
  const addHint = () => {
    const cost = parseInt(hintCost, 10);
    if (!hintText || isNaN(cost) || cost < 0) {
      setHintError('Hint cost must be a number ≥ 0');
      return;
    }
    setHintError('');
    const newHint = { description: hintText, cost };
    const updated = [...form.hints];
    if (editingHintIdx !== null) {
      updated[editingHintIdx] = newHint;
      setEditingHintIdx(null);
    } else {
      updated.push(newHint);
    }
    setForm(f => ({ ...f, hints: updated }));
    setHintText('');
    setHintCost('');
  };
  const deleteHint = (i) => setForm(f => ({ ...f, hints: f.hints.filter((_, idx) => idx !== i) }));
  const editHint   = (i) => {
    setHintText(form.hints[i].description);
    setHintCost(form.hints[i].cost);
    setEditingHintIdx(i);
  };

  // Files CRUD
  const addFile = () => {
    if (!fileInput) return;
    const updated = [...files];
    if (editingFileIdx !== null) {
      updated[editingFileIdx] = fileInput;
      setEditingFileIdx(null);
    } else {
      updated.push(fileInput);
    }
    setFiles(updated);
    setFileInput('');
  };
  const deleteFile = (i) => setFiles(fs => fs.filter((_, idx) => idx !== i));
  const editFile   = (i) => {
    setFileInput(files[i]);
    setEditingFileIdx(i);
  };

  // Outputs
  const jsonOutput = JSON.stringify({
    ...form,
    port: form.port ? parseInt(form.port, 10) : undefined,
    hints: form.hints.length ? form.hints : undefined,
    requirements: form.requirements.length ? form.requirements : undefined
  }, null, 4);

  const readmeOutput = `# ${form.name || '[Challenge Name]'}\n\n${form.description || 'Description here.'}

## Summary
- **Author:** ${form.author || '[Author]'}
- **Discord:** ${form.discord || '[Discord]'}
- **Category:** ${form.category}
- **Difficulty:** ${form.difficulty}

## Hints
${form.hints.length 
    ? form.hints.map(h => `- \`${h.description}\` (${h.cost} pts)`).join('\n') 
    : 'None'
}

## Files
${files.length 
    ? files.map(f => `- [\`${f}\`](./dist/${f})`).join('\n') 
    : 'None'
}

## Services
${form.port ? `- Runs on port \`${form.port}\`` : 'None'}

## Flag
- \`${form.flag || 'LNC25{...}'}\`
`;

  const outputText = activeTab === 'json' ? jsonOutput : readmeOutput;
  const outputName = activeTab === 'json' ? 'chall.json' : 'README.md';
  const outputType = activeTab === 'json' ? 'json' : 'readme';

  const downloadFile = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  };

  const copyToClipboard = async (text, type) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  const hasErrors = !flagValid || !!portError;

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex justify-center py-6">
      <div className="w-full max-w-5xl p-6 space-y-8">
        <h1 className="text-3xl font-bold text-center mb-4">LNC Challenge Config Generator</h1>

        {hasErrors && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded">
            Please fix the highlighted errors before copying or downloading.
          </div>
        )}

        {/* --- Challenge Info --- */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Challenge Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              className="bg-gray-800 text-white border border-gray-700"
              name="name"
              placeholder="Challenge Name"
              value={form.name}
              onChange={handleChange}
            />
            <Input
              className="bg-gray-800 text-white border border-gray-700"
              name="author"
              placeholder="Author"
              value={form.author}
              onChange={handleChange}
            />
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              name="difficulty"
              value={form.difficulty}
              onChange={handleChange}
              className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2"
            >
              {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <Textarea
              className="md:col-span-2 bg-gray-800 text-white border border-gray-700"
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
            />
            <Input
              className="bg-gray-800 text-white border border-gray-700"
              name="discord"
              placeholder="Discord"
              value={form.discord}
              onChange={handleChange}
            />
            <div className="space-y-1">
              <Input
                className={`bg-gray-800 text-white border ${!flagValid ? 'border-red-500' : 'border-gray-700'}`}
                name="flag"
                placeholder="Flag (LNC25{...})"
                value={form.flag}
                onChange={handleChange}
              />
              {!flagValid && <p className="text-red-500 text-xs">Must match LNC25{'{...}'}</p>}
            </div>
            <div className="space-y-1">
              <Input
                className={`bg-gray-800 text-white border ${portError ? 'border-red-500' : 'border-gray-700'}`}
                name="port"
                placeholder="Port (optional)"
                value={form.port}
                onChange={handleChange}
              />
              {portError && <p className="text-red-500 text-xs">{portError}</p>}
            </div>
          </div>
        </section>

        {/* --- Hints --- */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Hints</h2>
          <div className="grid md:grid-cols-3 gap-2">
            <Input
              className="bg-gray-800 text-white border border-gray-700"
              placeholder="Hint"
              value={hintText}
              onChange={e => setHintText(e.target.value)}
            />
            <Input
              className="bg-gray-800 text-white border border-gray-700"
              type="number"
              placeholder="Cost"
              value={hintCost}
              onChange={e => setHintCost(e.target.value)}
            />
            <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white" onClick={addHint}>
              Add
            </Button>
          </div>
          {hintError && <p className="text-red-500 text-xs">{hintError}</p>}
          {form.hints.length > 0 && (
            <Card className="border border-gray-700 rounded-md overflow-hidden">
              <CardContent className="p-4 text-white">
                <ul className="list-disc ml-5 space-y-1">
                  {form.hints.map((h, i) => (
                    <li key={i} className="flex justify-between items-center">
                      <span>{h.description} ({h.cost} pts)</span>
                      <div className="space-x-2 text-sm">
                        <button onClick={() => editHint(i)} className="text-indigo-400 hover:underline">
                          🖉 Edit
                        </button>
                        <button onClick={() => deleteHint(i)} className="text-red-400 hover:underline">
                          🗑 Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </section>

        {/* --- Files --- */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Files</h2>
          <div className="grid md:grid-cols-3 gap-2">
            <Input
              className="bg-gray-800 text-white border border-gray-700 md:col-span-2"
              placeholder="Filename (e.g. chall.zip)"
              value={fileInput}
              onChange={e => setFileInput(e.target.value)}
            />
            <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white" onClick={addFile}>
              Add
            </Button>
          </div>
          {files.length > 0 && (
            <Card className="border border-gray-700 rounded-md overflow-hidden">
              <CardContent className="p-4 text-white">
                <ul className="list-disc ml-5 space-y-1">
                  {files.map((f, i) => (
                    <li key={i} className="flex justify-between items-center">
                      <span>{f}</span>
                      <div className="space-x-2 text-sm">
                        <button onClick={() => editFile(i)} className="text-indigo-400 hover:underline">
                          🖉 Edit
                        </button>
                        <button onClick={() => deleteFile(i)} className="text-red-400 hover:underline">
                          🗑 Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </section>

        {/* --- Outputs --- */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Outputs</h2>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="transition-all duration-300 ease-in-out"
          >
            <div className="flex items-center justify-between mb-2 gap-4">
              <TabsList className="bg-transparent p-0 flex gap-2">
                <TabsTrigger
                  value="json"
                  className="
                    text-gray-800
                    hover:text-white hover:bg-indigo-600
                    data-[state=active]:bg-indigo-600 data-[state=active]:text-white
                    px-4 py-2 rounded-md transition
                    focus:outline-none focus:ring-2 focus:ring-indigo-500
                  "
                >
                  chall.json
                </TabsTrigger>
                <TabsTrigger
                  value="readme"
                  className="
                    text-gray-800
                    hover:text-white hover:bg-indigo-600
                    data-[state=active]:bg-indigo-600 data-[state=active]:text-white
                    px-4 py-2 rounded-md transition
                    focus:outline-none focus:ring-2 focus:ring-indigo-500
                  "
                >
                  README.md
                </TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => copyToClipboard(outputText, outputType)}
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white hover:bg-transparent transition"
                  disabled={hasErrors}
                >
                  <ClipboardIcon className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => downloadFile(outputText, outputName)}
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white hover:bg-transparent transition"
                  disabled={hasErrors}
                >
                  <DownloadIcon className="w-4 h-4" />
                </Button>
                {copied && <span className="text-green-500 text-xs ml-2">Copied!</span>}
              </div>
            </div>
            <TabsContent value="json">
              <Textarea
                className="h-96 bg-gray-800 text-white border border-gray-700 transition-all duration-300"
                value={jsonOutput}
                readOnly
              />
            </TabsContent>
            <TabsContent value="readme">
              <Textarea
                className="h-96 bg-gray-800 text-white border border-gray-700 transition-all duration-300 mt-4"
                value={readmeOutput}
                readOnly
              />
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </div>
  );
}
