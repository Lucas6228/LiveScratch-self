async function setCloudVar(value, AUTH_PROJECTID) { 
    // Use TurboWarp's server to bypass Scratch's account restrictions
    const connection = new WebSocket('wss://clouddata.turbowarp.org');
    
    // We can use a dummy username since TurboWarp doesn't enforce Scratch login
    const user = "Guest_" + Math.floor(Math.random() * 1000);

    let setAndClose = new Promise((res) => {
        try {
            connection.onerror = function (error) {
                console.error('WebSocket error:', error);
                connection.close();
                res({err: 'Connection failed. TurboWarp might be down or blocked.'});
            };

            connection.onopen = async () => {
                // Handshake with TurboWarp
                connection.send(
                    JSON.stringify({ method: 'handshake', project_id: AUTH_PROJECTID, user }) + '\n'
                );
                
                await new Promise((r) => setTimeout(r, 150));
                
                // Send the variable update
                connection.send(
                    JSON.stringify({
                        method: 'set',
                        project_id: AUTH_PROJECTID,
                        user: user,
                        name: '☁ verify',
                        value: value.toString(),
                    }) + '\n'
                );

                // Keep open for a split second to ensure delivery, then close
                setTimeout(() => {
                    connection.close();
                    res({ok: true});
                }, 100);
            };
        } catch(e) {
            res({err: e.message});
        }
    });
    return await setAndClose;
}
