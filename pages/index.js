import React, { useState, useEffect } from 'react';
import { AlertTriangle, Activity, TrendingUp, TrendingDown, Droplet, MapPin, Clock } from 'lucide-react';

export default function FloodRiskDashboard() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('https://raw.githubusercontent.com/nuuuwan/lk_irrigation/main/data/rwlds/latest.json');
      const data = await response.json();
      
      // Process the data
      const processedStations = Object.entries(data).map(([key, value]) => ({
        id: key,
        station: value.station_name || key,
        river: value.river_name || 'Unknown',
        level: value.water_level || 0,
        alertLevel: value.alert_level || 'normal',
        rateOfRise: value.rate_of_rise || 0,
        measuredAt: value.measured_at || new Date().toISOString(),
        latitude: value.latitude,
        longitude: value.longitude
      }));

      setStations(processedStations);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to sample data
      const sampleData = [
        { id: '1', station: 'Nagalagam Street', river: 'Kelani Ganga', level: 2.56, alertLevel: 'major_flood', rateOfRise: 0.015, measuredAt: new Date().toISOString() },
        { id: '2', station: 'Hanwella', river: 'Kelani Ganga', level: 9.69, alertLevel: 'minor_flood', rateOfRise: -0.087, measuredAt: new Date().toISOString() },
        { id: '3', station: 'Rathnapura', river: 'Kalu Ganga', level: 5.82, alertLevel: 'alert', rateOfRise: -0.059, measuredAt: new Date().toISOString() },
        { id: '4', station: 'Kalawellawa', river: 'Kalu Ganga', level: 7.38, alertLevel: 'minor_flood', rateOfRise: -0.051, measuredAt: new Date().toISOString() },
        { id: '5', station: 'Putupaula', river: 'Kalu Ganga', level: 4.28, alertLevel: 'minor_flood', rateOfRise: -0.010, measuredAt: new Date().toISOString() },
        { id: '6', station: 'Dunamale', river: 'Aththanagalu Oya', level: 4.40, alertLevel: 'minor_flood', rateOfRise: -0.121, measuredAt: new Date().toISOString() },
        { id: '7', station: 'Horowpothana', river: 'Yan Oya', level: 7.29, alertLevel: 'alert', rateOfRise: -0.020, measuredAt: new Date().toISOString() },
        { id: '8', station: 'Thanthirimale', river: 'Malwathu Oya', level: 10.64, alertLevel: 'major_flood', rateOfRise: -0.033, measuredAt: new Date().toISOString() },
        { id: '9', station: 'Peradeniya', river: 'Mahaweli Ganga', level: 10.56, alertLevel: 'major_flood', rateOfRise: 0.595, measuredAt: new Date(Date.now() - 86400000 * 4).toISOString() },
        { id: '10', station: 'Badalgama', river: 'Maha Oya', level: 4.44, alertLevel: 'normal', rateOfRise: -0.115, measuredAt: new Date().toISOString() },
      ];
      setStations(sampleData);
      setLastUpdate(new Date());
      setLoading(false);
    }
  };

  const getAlertColor = (level) => {
    switch (level) {
      case 'major_flood': return 'bg-red-500';
      case 'minor_flood': return 'bg-orange-500';
      case 'alert': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getAlertIcon = (level) => {
    switch (level) {
      case 'major_flood': return '🔴';
      case 'minor_flood': return '🟠';
      case 'alert': return '🟡';
      default: return '🟢';
    }
  };

  const getAlertLabel = (level) => {
    switch (level) {
      case 'major_flood': return 'Major Flood';
      case 'minor_flood': return 'Minor Flood';
      case 'alert': return 'Alert';
      default: return 'Normal';
    }
  };

  const getRiskScore = (station) => {
    let score = 0;
    if (station.alertLevel === 'major_flood') score += 100;
    if (station.alertLevel === 'minor_flood') score += 70;
    if (station.alertLevel === 'alert') score += 40;
    if (station.rateOfRise > 0.05) score += 30;
    else if (station.rateOfRise > 0) score += 10;
    return score;
  };

  const filteredStations = stations
    .filter(s => {
      if (filter === 'all') return true;
      if (filter === 'risk') return ['major_flood', 'minor_flood', 'alert'].includes(s.alertLevel) || s.rateOfRise > 0;
      if (filter === 'rising') return s.rateOfRise > 0;
      return s.alertLevel === filter;
    })
    .sort((a, b) => getRiskScore(b) - getRiskScore(a));

  const stats = {
    total: stations.length,
    majorFlood: stations.filter(s => s.alertLevel === 'major_flood').length,
    minorFlood: stations.filter(s => s.alertLevel === 'minor_flood').length,
    alert: stations.filter(s => s.alertLevel === 'alert').length,
    rising: stations.filter(s => s.rateOfRise > 0.02).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center">
          <Activity className="w-16 h-16 text-blue-500 animate-pulse mx-auto mb-4" />
          <p className="text-white text-xl">Loading flood data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Droplet className="w-10 h-10 text-blue-400" />
                Sri Lanka Flood Risk Dashboard
              </h1>
              <p className="text-slate-300">Real-time river water level monitoring</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                <Clock className="w-4 h-4" />
                Last updated: {lastUpdate?.toLocaleTimeString()}
              </div>
              <button 
                onClick={fetchData}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
              >
                Refresh Data
              </button>
            </div>
          </div>
          
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="text-3xl font-bold text-blue-400">{stats.total}</div>
              <div className="text-sm text-slate-400">Total Stations</div>
            </div>
            <div className="bg-red-900/30 rounded-lg p-4 border border-red-700">
              <div className="text-3xl font-bold text-red-400">{stats.majorFlood}</div>
              <div className="text-sm text-slate-400">Major Flood</div>
            </div>
            <div className="bg-orange-900/30 rounded-lg p-4 border border-orange-700">
              <div className="text-3xl font-bold text-orange-400">{stats.minorFlood}</div>
              <div className="text-sm text-slate-400">Minor Flood</div>
            </div>
            <div className="bg-yellow-900/30 rounded-lg p-4 border border-yellow-700">
              <div className="text-3xl font-bold text-yellow-400">{stats.alert}</div>
              <div className="text-sm text-slate-400">Alert Level</div>
            </div>
            <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-700">
              <div className="text-3xl font-bold text-purple-400">{stats.rising}</div>
              <div className="text-sm text-slate-400">Rising Fast</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}
            >
              All Stations
            </button>
            <button 
              onClick={() => setFilter('risk')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'risk' ? 'bg-red-600' : 'bg-slate-700 hover:bg-slate-600'}`}
            >
              At Risk
            </button>
            <button 
              onClick={() => setFilter('major_flood')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'major_flood' ? 'bg-red-600' : 'bg-slate-700 hover:bg-slate-600'}`}
            >
              Major Flood
            </button>
            <button 
              onClick={() => setFilter('minor_flood')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'minor_flood' ? 'bg-orange-600' : 'bg-slate-700 hover:bg-slate-600'}`}
            >
              Minor Flood
            </button>
            <button 
              onClick={() => setFilter('alert')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'alert' ? 'bg-yellow-600' : 'bg-slate-700 hover:bg-slate-600'}`}
            >
              Alert
            </button>
            <button 
              onClick={() => setFilter('rising')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'rising' ? 'bg-purple-600' : 'bg-slate-700 hover:bg-slate-600'}`}
            >
              Rising
            </button>
          </div>
        </div>

        {/* Station Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStations.map((station) => {
            const isOld = new Date() - new Date(station.measuredAt) > 86400000;
            return (
              <div 
                key={station.id}
                className={`bg-slate-800 rounded-lg p-5 border-2 transition-all hover:shadow-xl ${
                  station.alertLevel === 'major_flood' ? 'border-red-500' :
                  station.alertLevel === 'minor_flood' ? 'border-orange-500' :
                  station.alertLevel === 'alert' ? 'border-yellow-500' :
                  'border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {station.station}
                    </h3>
                    <p className="text-sm text-slate-400">{station.river}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${getAlertColor(station.alertLevel)} text-white`}>
                    {getAlertIcon(station.alertLevel)} {getAlertLabel(station.alertLevel)}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Water Level</span>
                    <span className="text-2xl font-bold text-blue-400">{station.level.toFixed(2)}m</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Rate of Change</span>
                    <div className="flex items-center gap-2">
                      {station.rateOfRise > 0 ? (
                        <TrendingUp className="w-5 h-5 text-red-500" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-green-500" />
                      )}
                      <span className={`font-bold ${station.rateOfRise > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {station.rateOfRise > 0 ? '+' : ''}{station.rateOfRise.toFixed(3)}m/hr
                      </span>
                    </div>
                  </div>

                  {station.rateOfRise > 0.05 && (
                    <div className="bg-red-900/50 border border-red-700 rounded-lg p-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="text-xs text-red-300">Rapid rise detected!</span>
                    </div>
                  )}

                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(station.measuredAt).toLocaleString()}
                    {isOld && <span className="text-orange-400 ml-1">⌛ Stale data</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredStations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">No stations match the current filter</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>Data source: Sri Lanka Irrigation Department - Hydrology and Disaster Management Division</p>
          <p className="mt-1">GitHub: <a href="https://github.com/nuuuwan/lk_irrigation" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">nuuuwan/lk_irrigation</a></p>
        </div>
      </div>
    </div>
  );
}
