import { spawn } from 'child_process';

export default function handler(req, res) {
    if (req.method === 'POST') {
        const { audioFilePath } = req.body;
        const process = spawn('python3', ['./path-to-python-script/transcribe.py', audioFilePath]);

        process.stdout.on('data', (data) => {
            res.status(200).json({ transcript: data.toString() });
        });

        process.stderr.on('data', (data) => {
            res.status(500).json({ error: data.toString() });
        });
    } else {
        res.status(405).json({ error: 'Method not allowed.' });
    }
}
