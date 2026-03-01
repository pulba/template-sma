import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();

// Paths to rename (from -> to)
const renames = [
    ['src/pages/ppdb.astro', 'src/pages/pendaftaran.astro'],
    ['src/pages/ppdb', 'src/pages/pendaftaran'],
    ['src/pages/dashboard/ppdb.astro', 'src/pages/dashboard/pendaftaran.astro'],
    ['src/pages/dashboard/ppdb', 'src/pages/dashboard/pendaftaran'],
    ['src/pages/api/ppdb', 'src/pages/api/pendaftaran'],
    ['src/content/ppdb', 'src/content/pendaftaran'],
    ['src/content/pamflate/ppdb.json', 'src/content/pamflate/pendaftaran.json']
];

for (const [from, to] of renames) {
    const fromPath = path.join(projectRoot, from);
    const toPath = path.join(projectRoot, to);
    if (fs.existsSync(fromPath)) {
        try {
            fs.renameSync(fromPath, toPath);
            console.log(`Renamed: ${from} -> ${to}`);
        } catch (e) {
            console.error(`Failed to rename ${from}: ${e.message}`);
        }
    } else {
        console.log(`File/Directory does not exist: ${from}`);
    }
}

// String replacements
const replaceInFile = (filePath, replacements) => {
    const fullPath = path.join(projectRoot, filePath);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let changed = false;
        replacements.forEach(({ from, to }) => {
            if (content.match(from)) {
                content = content.replace(from, to);
                changed = true;
            }
        });
        if (changed) {
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log(`Updated content: ${filePath}`);
        }
    } else {
        console.log(`File does not exist for replacement: ${filePath}`);
    }
};

const replaceInDir = (dirPath, replacements) => {
    const fullPath = path.join(projectRoot, dirPath);
    if (fs.existsSync(fullPath)) {
        const files = fs.readdirSync(fullPath);
        files.forEach(file => {
            const filePath = path.join(fullPath, file);
            if (fs.statSync(filePath).isFile()) {
                let content = fs.readFileSync(filePath, 'utf8');
                let changed = false;
                replacements.forEach(({ from, to }) => {
                    if (content.match(from)) {
                        content = content.replace(from, to);
                        changed = true;
                    }
                });
                if (changed) {
                    fs.writeFileSync(filePath, content, 'utf8');
                    console.log(`Updated content: ${path.join(dirPath, file)}`);
                }
            }
        });
    }
};

const replaceInDirDeep = (dirPath, replacements) => {
    const fullPath = path.join(projectRoot, dirPath);
    if (fs.existsSync(fullPath)) {
        const files = fs.readdirSync(fullPath);
        files.forEach(file => {
            const filePath = path.join(fullPath, file);
            if (fs.statSync(filePath).isDirectory()) {
                replaceInDirDeep(path.join(dirPath, file), replacements);
            } else if (fs.statSync(filePath).isFile()) {
                let content = fs.readFileSync(filePath, 'utf8');
                let changed = false;
                replacements.forEach(({ from, to }) => {
                    if (content.match(from)) {
                        content = content.replace(from, to);
                        changed = true;
                    }
                });
                if (changed) {
                    fs.writeFileSync(filePath, content, 'utf8');
                    console.log(`Updated content: ${path.join(dirPath, file)}`);
                }
            }
        });
    }
}

// Replacements configuration
const replacementTasks = [
    {
        file: 'src/components/Navbar.astro',
        replacements: [
            { from: /getCollection\(['"]ppdb['"]\)/g, to: "getCollection('pendaftaran')" },
            { from: /\/ppdb/g, to: '/pendaftaran' }
        ]
    },
    {
        file: 'src/components/Footer.astro',
        replacements: [
            { from: /\/ppdb/g, to: '/pendaftaran' }
        ]
    },
    {
        file: 'src/components/HeroSection.astro',
        replacements: [
            { from: /getCollection\(['"]ppdb['"]\)/g, to: "getCollection('pendaftaran')" },
            { from: /\/ppdb/g, to: '/pendaftaran' }
        ]
    },
    {
        file: 'src/pages/index.astro',
        replacements: [
            { from: /\/ppdb/g, to: '/pendaftaran' }
        ]
    },
    {
        file: 'src/pages/pendaftaran.astro',
        replacements: [
            { from: /\/ppdb/g, to: '/pendaftaran' },
            { from: /getCollection\(['"]ppdb['"]\)/g, to: 'getCollection("pendaftaran")' },
            { from: /\/api\/ppdb\/register/g, to: '/api/pendaftaran/register' }
        ]
    },
    {
        file: 'src/pages/pendaftaran/status.astro',
        replacements: [
            { from: /\/ppdb/g, to: '/pendaftaran' },
            { from: /\/api\/ppdb\/get-status/g, to: '/api/pendaftaran/get-status' }
        ]
    },
    {
        file: 'src/pages/dashboard/pendaftaran.astro',
        replacements: [
            { from: /\/ppdb/g, to: '/pendaftaran' },
            { from: /\/api\/ppdb\/export/g, to: '/api/pendaftaran/export' },
            { from: /\/dashboard\/ppdb/g, to: '/dashboard/pendaftaran' }
        ]
    },
    {
        file: 'src/pages/dashboard/pendaftaran/detail.astro',
        replacements: [
            { from: /\/ppdb/g, to: '/pendaftaran' },
            { from: /\/api\/ppdb/g, to: '/api/pendaftaran' },
            { from: /\/dashboard\/ppdb/g, to: '/dashboard/pendaftaran' }
        ]
    },
    {
        file: 'src/pages/dashboard/login.astro',
        replacements: [
            { from: /\/dashboard\/ppdb/g, to: '/dashboard/pendaftaran' }
        ]
    },
    {
        file: 'src/middleware/auth.ts',
        replacements: [
            { from: /\/dashboard\/ppdb/g, to: '/dashboard/pendaftaran' },
            { from: /\/api\/ppdb/g, to: '/api/pendaftaran' },
            { from: /String\(url\.pathname\)\.startsWith\(['"]\/dashboard\/ppdb['"]\)/g, to: 'String(url.pathname).startsWith("/dashboard/pendaftaran")' },
            { from: /String\(url\.pathname\)\.startsWith\(['"]\/dashboard\/ppdb\/detail['"]\)/g, to: 'String(url.pathname).startsWith("/dashboard/pendaftaran/detail")' },
            { from: /String\(url\.pathname\)\.startsWith\(['"]\/api\/ppdb['"]\)/g, to: 'String(url.pathname).startsWith("/api/pendaftaran")' }
        ]
    },
    {
        file: 'src/content/config.ts',
        replacements: [
            { from: /ppdb:\s*ppdbSettings/g, to: 'pendaftaran: ppdbSettings' } // keep ppdbSettings as noted
        ]
    },
    {
        file: 'tina/config.ts',
        replacements: [
            { from: /src\/content\/ppdb/g, to: 'src/content/pendaftaran' },
            { from: /name:\s*['"]ppdb['"]/g, to: 'name: "pendaftaran"' },
            { from: /label:\s*['"]PPDB['"]/ig, to: 'label: "Pendaftaran"' }
        ]
    }
];

replacementTasks.forEach(task => {
    replaceInFile(task.file, task.replacements);
});

// For jurusan
replaceInDirDeep('src/pages/jurusan', [
    { from: /\/ppdb/g, to: '/pendaftaran' }
]);

// API Routes replacements Deeply
replaceInDirDeep('src/pages/api/pendaftaran', [
    { from: /\/ppdb/g, to: '/pendaftaran' }
]);

console.log("Migration script part 2 complete!");
