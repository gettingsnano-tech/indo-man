import { useEffect, useState, useRef } from 'react';
import api from '../../api/axios';
import { Card, Button, Input, Badge, Spinner } from '../../components/ui';
import { ShieldCheck, ShieldAlert, Camera, Upload, RefreshCw, X, Check } from 'lucide-react';

export default function KYC() {
    const [statusData, setStatusData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [fullName, setFullName] = useState('');
    const [idType, setIdType] = useState('National ID');
    const [idNumber, setIdNumber] = useState('');
    const [documentUrl, setDocumentUrl] = useState('');
    const [error, setError] = useState('');
    
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [stream, setStream] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const fetchStatus = async () => {
        try {
            const res = await api.get('/kyc/status');
            setStatusData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        return () => {
            if (stream) stream.getTracks().forEach(t => t.stop());
        };
    }, []);

    useEffect(() => {
        if (isCameraOpen && stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [isCameraOpen, stream]);

    const startCamera = async () => {
        try {
            const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            setStream(s);
            setIsCameraOpen(true);
        } catch (err) {
            setError('Could not access camera. Please check permissions.');
        }
    };

    const stopCamera = () => {
        if (stream) stream.getTracks().forEach(t => t.stop());
        setStream(null);
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg');
            setDocumentUrl(dataUrl);
            stopCamera();
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setDocumentUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!documentUrl) {
            setError('Please upload or capture a photo of your ID.');
            return;
        }
        try {
            await api.post('/kyc/submit', {
                full_name: fullName,
                id_type: idType,
                id_number: idNumber,
                document_url: documentUrl
            });
            fetchStatus();
        } catch (err) {
            setError(err.response?.data?.error || 'Submission failed');
        }
    };

    if (loading) return <div className="flex h-full items-center justify-center"><Spinner /></div>;

    const status = statusData?.status || 'not_submitted';

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-display font-bold">Identity Verification</h1>
                    <p className="text-gray-500 mt-1">Complete your KYC to unlock all platform features.</p>
                </div>
                <Badge variant={
                    status === 'verified' ? 'success' : 
                    status === 'rejected' ? 'danger' : 
                    status === 'pending' ? 'warning' : 'outline'
                } className="px-4 py-1.5 text-xs font-bold tracking-widest">
                    {status.toUpperCase()}
                </Badge>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2">
                    <Card className="p-8 text-center bg-gradient-to-br from-[#111118] to-[#0A0A0F] border-[#1E1E2A] h-full flex flex-col justify-center">
                        <div className="flex justify-center mb-6">
                            {status === 'verified' ? (
                                <div className="p-6 bg-emerald-500/10 rounded-full border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                                    <ShieldCheck size={64} className="text-emerald-500" />
                                </div>
                            ) : status === 'rejected' ? (
                                <div className="p-6 bg-red-500/10 rounded-full border border-red-500/20 shadow-lg shadow-red-500/5">
                                    <ShieldAlert size={64} className="text-red-500" />
                                </div>
                            ) : status === 'pending' ? (
                                <div className="p-6 bg-amber-500/10 rounded-full border border-amber-500/20 shadow-lg shadow-amber-500/5">
                                    <RefreshCw size={64} className="text-amber-500 animate-spin-slow" />
                                </div>
                            ) : (
                                <div className="p-6 bg-gray-800/30 rounded-full border border-gray-700/30">
                                    <ShieldCheck size={64} className="text-gray-600" />
                                </div>
                            )}
                        </div>
                        
                        <h2 className="text-2xl font-bold mb-3">
                            {status === 'verified' ? 'System Verified' : 
                             status === 'pending' ? 'Under Review' : 
                             status === 'rejected' ? 'Verification Failed' : 
                             'Identify Yourself'}
                        </h2>
                        
                        <p className="text-gray-400 text-sm leading-relaxed mb-8">
                            {status === 'verified' ? 'Your identity is confirmed. Enjoy unrestricted access to global banking.' : 
                             status === 'pending' ? 'Our compliance team is reviewing your documents. This usually takes 24 hours.' : 
                             status === 'rejected' ? `Rejected: ${statusData.admin_note || 'Please resubmit your documents.'}` : 
                             'Secure your account and increase your limits by providing a valid government-issued ID.'}
                        </p>
                        
                        <div className="space-y-3 pt-6 border-t border-[#1E1E2A]">
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                <span>Encrypted document storage</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                <span>Biometric data protection</span>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-3">
                    {(status === 'not_submitted' || status === 'rejected') ? (
                        <Card className="p-8 bg-[#111118] border-[#1E1E2A]">
                            <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                                <Camera size={20} className="text-[#2563EB]" />
                                Submission Form
                            </h3>
                            
                            {error && <div className="bg-red-500/10 text-red-500 p-4 rounded-xl mb-8 text-sm border border-red-500/20">{error}</div>}
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input label="Full Legal Name" placeholder="As shown on ID" value={fullName} onChange={e => setFullName(e.target.value)} required />
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">ID Document Type</label>
                                        <select 
                                            value={idType} 
                                            onChange={e => setIdType(e.target.value)}
                                            className="w-full bg-[#0A0A0F] border border-[#1E1E2A] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#2563EB] transition-colors"
                                        >
                                            <option value="National ID">National ID Card</option>
                                            <option value="Passport">International Passport</option>
                                            <option value="Driver License">Driver's License</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <Input label="ID Serial Number" placeholder="Document ID number" value={idNumber} onChange={e => setIdNumber(e.target.value)} required />
                                
                                {/* Photo Upload / Capture Section */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Photo of Document</label>
                                    
                                    {isCameraOpen ? (
                                        <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-[#2563EB]/30 aspect-video">
                                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                                                <Button size="sm" type="button" onClick={capturePhoto} className="rounded-full h-12 w-12 p-0 flex items-center justify-center">
                                                    <Camera size={24} />
                                                </Button>
                                                <Button size="sm" type="button" variant="danger" onClick={stopCamera} className="rounded-full h-12 w-12 p-0 flex items-center justify-center">
                                                    <X size={24} />
                                                </Button>
                                            </div>
                                        </div>
                                    ) : documentUrl ? (
                                        <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500/30 group">
                                            <img src={documentUrl} alt="ID Preview" className="w-full max-h-64 object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                                <Button size="sm" type="button" onClick={() => setDocumentUrl('')} variant="danger">
                                                    <X size={16} className="mr-2" /> Remove
                                                </Button>
                                                <Button size="sm" type="button" onClick={startCamera}>
                                                    <Camera size={16} className="mr-2" /> Retake
                                                </Button>
                                            </div>
                                            <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1 rounded-full">
                                                <Check size={16} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <button 
                                                type="button"
                                                onClick={startCamera}
                                                className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed border-[#1E1E2A] hover:border-[#2563EB]/50 hover:bg-[#2563EB]/5 transition-all group"
                                            >
                                                <div className="w-12 h-12 rounded-full bg-[#1E1E2A] flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <Camera size={24} className="text-gray-400 group-hover:text-[#2563EB]" />
                                                </div>
                                                <span className="text-sm font-medium text-gray-500 group-hover:text-white">Take Live Photo</span>
                                            </button>
                                            
                                            <label className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed border-[#1E1E2A] hover:border-[#2563EB]/50 hover:bg-[#2563EB]/5 transition-all group cursor-pointer">
                                                <div className="w-12 h-12 rounded-full bg-[#1E1E2A] flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <Upload size={24} className="text-gray-400 group-hover:text-[#2563EB]" />
                                                </div>
                                                <span className="text-sm font-medium text-gray-500 group-hover:text-white">Upload File</span>
                                                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                                            </label>
                                        </div>
                                    )}
                                </div>
                                
                                <canvas ref={canvasRef} className="hidden" />
                                
                                <Button type="submit" className="w-full py-6 text-lg font-bold shadow-xl shadow-blue-500/20" disabled={!documentUrl}>
                                    Submit Verification
                                </Button>
                            </form>
                        </Card>
                    ) : (
                        <div className="h-full flex items-center justify-center">
                            <Card className="p-12 text-center bg-[#111118]/30 border-dashed border-2 border-[#1E1E2A] w-full">
                                <ShieldCheck size={48} className="text-gray-700 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-600">Verification Locked</h3>
                                <p className="text-sm text-gray-500 mt-2">You have already submitted your identity documents.</p>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
