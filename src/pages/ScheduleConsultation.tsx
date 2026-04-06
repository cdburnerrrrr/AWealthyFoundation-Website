import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../api/client';
import { useAppStore } from '../store/appStore';

const ADVISORS = [
  { id: 1, name: 'Sarah Mitchell', specialty: 'Retirement Planning', rating: 4.9, reviews: 127 },
  { id: 2, name: 'James Chen', specialty: 'Investment Strategy', rating: 4.8, reviews: 98 },
  { id: 3, name: 'Maria Rodriguez', specialty: 'Debt Management', rating: 4.9, reviews: 156 },
];

const TIME_SLOTS = [
  '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
];

export default function ScheduleConsultation() {
  const navigate = useNavigate();
  const { setConsultations, consultations } = useAppStore();
  const [step, setStep] = useState(1);
  const [selectedAdvisor, setSelectedAdvisor] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Generate next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    return date;
  });

  const handleSchedule = async () => {
    if (!selectedAdvisor || !selectedDate || !selectedTime) return;

    setSubmitting(true);
    try {
      const [year, month, day] = selectedDate.split('-');
      const [hours] = selectedTime.split(':');
      const scheduledDate = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hours)
      );
      
      const result = await api.createConsultation(
        Math.floor(scheduledDate.getTime() / 1000),
        notes || undefined
      );
      
      setConsultations([result.consultation, ...consultations]);
      setSuccess(true);
    } catch (error) {
      console.error('Failed to schedule consultation:', error);
      alert('Failed to schedule consultation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    const advisor = ADVISORS.find(a => a.id === selectedAdvisor);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700/50 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Consultation Scheduled!</h2>
          <p className="text-slate-400 mb-6">
            Your consultation with {advisor?.name} has been scheduled for{' '}
            {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}{' '}
            at {selectedTime}.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/my-foundation')}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/my-foundation')}
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </button>
            <span className="text-slate-400 text-sm">Schedule Consultation</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                s < step ? 'bg-emerald-500 text-white' :
                s === step ? 'bg-amber-500 text-white' :
                'bg-slate-700 text-slate-400'
              }`}>
                {s < step ? <CheckCircle className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 ${s < step ? 'bg-emerald-500' : 'bg-slate-700'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Select Advisor */}
        {step === 1 && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-amber-500" />
              Select Your Advisor
            </h2>
            <div className="space-y-4">
              {ADVISORS.map((advisor) => (
                <button
                  key={advisor.id}
                  onClick={() => setSelectedAdvisor(advisor.id)}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    selectedAdvisor === advisor.id
                      ? 'bg-amber-500/20 border-2 border-amber-500'
                      : 'bg-slate-700/30 border-2 border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">{advisor.name}</h3>
                      <p className="text-slate-400 text-sm">{advisor.specialty}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-amber-500 font-medium">★ {advisor.rating}</div>
                      <p className="text-slate-500 text-xs">{advisor.reviews} reviews</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => selectedAdvisor && setStep(2)}
              disabled={!selectedAdvisor}
              className={`w-full mt-6 py-3 rounded-xl font-medium transition-all ${
                selectedAdvisor
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
                  : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Select Date & Time */}
        {step === 2 && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-500" />
              Select Date & Time
            </h2>
            
            {/* Date Selection */}
            <div className="mb-6">
              <label className="text-slate-400 text-sm mb-2 block">Select Date</label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {dates.map((date) => {
                  const dateStr = date.toISOString().split('T')[0];
                  const isSelected = selectedDate === dateStr;
                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`p-2 rounded-lg text-center transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-700/30 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <div className="text-xs">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                      <div className="text-lg font-medium">{date.getDate()}</div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Time Selection */}
            <div className="mb-6">
              <label className="text-slate-400 text-sm mb-2 block">Select Time</label>
              <div className="grid grid-cols-4 gap-2">
                {TIME_SLOTS.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-2 rounded-lg text-center transition-all ${
                      selectedTime === time
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-700/30 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 bg-slate-700/50 text-white font-medium rounded-xl hover:bg-slate-700 transition-all"
              >
                Back
              </button>
              <button
                onClick={() => selectedDate && selectedTime && setStep(3)}
                disabled={!selectedDate || !selectedTime}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                  selectedDate && selectedTime
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
                    : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                }`}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-amber-500" />
              Confirm Your Booking
            </h2>
            
            {/* Summary */}
            <div className="bg-slate-700/30 rounded-xl p-4 mb-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Advisor</span>
                  <span className="text-white">{ADVISORS.find(a => a.id === selectedAdvisor)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date</span>
                  <span className="text-white">
                    {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Time</span>
                  <span className="text-white">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Duration</span>
                  <span className="text-white">60 minutes</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="text-slate-400 text-sm mb-2 block">
                Add any notes for your advisor (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What would you like to discuss during the consultation?"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none h-24"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 bg-slate-700/50 text-white font-medium rounded-xl hover:bg-slate-700 transition-all"
              >
                Back
              </button>
              <button
                onClick={handleSchedule}
                disabled={submitting}
                className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  submitting
                    ? 'bg-amber-500/50 text-white'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
                }`}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  'Schedule Consultation'
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
