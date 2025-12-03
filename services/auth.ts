
const LOCAL_STORAGE_KEY = 'biometric_enabled';

export const isBiometricEnabled = () => {
    return localStorage.getItem(LOCAL_STORAGE_KEY) === 'true';
}

export const enableBiometric = async (): Promise<boolean> => {
    try {
        // Create a dummy challenge
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
        
        // We use platform authenticator (TouchID/FaceID/Windows Hello)
        await navigator.credentials.create({
            publicKey: {
                challenge,
                rp: { name: "LinkVault" },
                user: {
                    id: new Uint8Array(16), // Dummy ID
                    name: "user@linkvault.app",
                    displayName: "LinkVault User"
                },
                pubKeyCredParams: [{ alg: -7, type: "public-key" }, { alg: -257, type: "public-key" }],
                authenticatorSelection: { 
                    authenticatorAttachment: "platform",
                    userVerification: "required" 
                },
                timeout: 60000,
                attestation: "none"
            }
        });
        localStorage.setItem(LOCAL_STORAGE_KEY, 'true');
        return true;
    } catch (e: any) {
        console.error("Biometric setup failed", e);
        if (e.name === 'NotAllowedError' || e.message?.includes('publickey-credentials-create')) {
             throw new Error("Biometrics are restricted in this preview environment. Please open the app in a full window or new tab to enable security features.");
        }
        throw new Error("Failed to set up biometrics. Please try again.");
    }
}

export const disableBiometric = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
}

export const authenticate = async (): Promise<boolean> => {
    try {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
        
        // Request assertion
        const credential = await navigator.credentials.get({
            publicKey: {
                challenge,
                timeout: 60000,
                userVerification: "required"
            }
        });
        
        return !!credential;
    } catch (e: any) {
        console.error("Authentication failed", e);
        return false;
    }
}
