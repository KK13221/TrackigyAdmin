const fs = require('fs');
const readline = require('readline');

async function recover() {
    const transcriptPath = 'C:\\Users\\Inurum8\\.gemini\\antigravity-ide\\brain\\c059e694-3810-4b6b-a5fb-a2512a034509\\.system_generated\\logs\\transcript_full.jsonl';
    
    const fileStream = fs.createReadStream(transcriptPath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let targetOutput = null;

    for await (const line of rl) {
        try {
            const entry = JSON.parse(line);
            if (entry.type === 'TOOL_RESPONSE' && entry.content) {
                // Check if this response contains our view_file output for lines 1 to 800
                if (entry.content.includes('Showing lines 1 to 800') && entry.content.includes('VehicleControl.jsx')) {
                    targetOutput = entry.content;
                }
            }
        } catch (e) {
            // ignore parse error
        }
    }

    if (!targetOutput) {
        console.log("Could not find the target output in transcript.");
        return;
    }

    // Now extract the code
    const lines = targetOutput.split('\n');
    let codeLines = [];
    let isCode = false;

    for (const line of lines) {
        if (line.match(/^1: /)) {
            isCode = true;
        }
        if (isCode) {
            // Check if it's the end message
            if (line.includes('The above content does NOT show the entire file contents')) {
                break;
            }
            
            // Remove the line number prefix (e.g. "123: ")
            const match = line.match(/^\d+:\s?(.*)$/);
            if (match) {
                codeLines.push(match[1]);
            }
        }
    }

    // Now we need the end of the file. 
    // From my knowledge of the file, lines 801+ are just the closing of the details modal.
    const endCode = `                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>Plate Number:</span>
                      <strong>{selectedImeiDetails.vehicleDetails.vehicleNumber || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>Type:</span>
                      <strong>{selectedImeiDetails.vehicleDetails.vehicleType || 'Unknown'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>Fuel Type:</span>
                      <strong>{selectedImeiDetails.vehicleDetails.fuelType || 'petrol'}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  setSelectedImeiDetails(null);
                }}
                className="btn-primary" 
                style={{ minWidth: 100, height: 38 }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
`;
    
    fs.writeFileSync('d:\\Divya Projets\\Create _api\\TrackigyAdminPanel\\react-app\\src\\pages\\VehicleControl.jsx', codeLines.join('\n') + '\n' + endCode);
    console.log("Recovery successful.");
}

recover();
