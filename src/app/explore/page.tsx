"use client";

import React, { useState, useMemo } from 'react';
import { SCHEMES_DATABASE } from '@/data/schemes';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ConfidenceBadge } from '@/components/ui/ConfidenceBadge';
import { SchemeDetailModal } from '@/app/results/SchemeDetailModal';
import { SchemeMatchResult, Scheme } from '@/types/assessment';
import { Search, Filter, IndianRupee, Building, Briefcase } from 'lucide-react';
import { formatINR } from '@/lib/engine';

export default function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [selectedMinistry, setSelectedMinistry] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('name-asc');
  
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);

  // Derive unique filter options from the dataset
  const categories = useMemo(() => {
    const cats = new Set<string>();
    SCHEMES_DATABASE.forEach(s => s.categoryTags?.forEach(c => cats.add(c)));
    return ['All', ...Array.from(cats).sort()];
  }, []);

  const sectors = useMemo(() => {
    const secs = new Set<string>();
    SCHEMES_DATABASE.forEach(s => s.sectors?.forEach(sec => secs.add(sec)));
    return ['All', ...Array.from(secs).sort()];
  }, []);

  const ministries = useMemo(() => {
    const mins = new Set<string>();
    SCHEMES_DATABASE.forEach(s => { if(s.ministry) mins.add(s.ministry) });
    return ['All', ...Array.from(mins).sort()];
  }, []);

  // Compute live statistics
  const stats = useMemo(() => {
    return {
      total: SCHEMES_DATABASE.length,
      withFunding: SCHEMES_DATABASE.filter(s => s.maxFundingAmount || s.subsidyRules).length,
      verified: SCHEMES_DATABASE.filter(s => !s.needsVerification).length,
      withEligibility: SCHEMES_DATABASE.filter(s => Object.keys(s.rules || {}).length > 0).length
    };
  }, []);

  // Filter and Sort Pipeline
  const filteredSchemes = useMemo(() => {
    return SCHEMES_DATABASE.filter(s => {
      // Search
      const searchMatch = !searchTerm || [
        s.name, s.ministry, s.purpose, s.description, 
        ...(s.categoryTags || []), ...(s.sectors || [])
      ].join(' ').toLowerCase().includes(searchTerm.toLowerCase());

      // Filters
      const categoryMatch = selectedCategory === 'All' || s.categoryTags?.includes(selectedCategory);
      const sectorMatch = selectedSector === 'All' || s.sectors?.includes(selectedSector);
      const ministryMatch = selectedMinistry === 'All' || s.ministry === selectedMinistry;

      return searchMatch && categoryMatch && sectorMatch && ministryMatch;
    }).sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'funding-desc') return (b.maxFundingAmount || 0) - (a.maxFundingAmount || 0);
      return 0;
    });
  }, [searchTerm, selectedCategory, selectedSector, selectedMinistry, sortBy]);

  // Construct a dummy SchemeMatchResult for the Modal
  const dummyResultForModal = selectedScheme ? {
    scheme: selectedScheme,
    matchScore: null,
    eligibility: { isEligible: true, matchedRules: [], pendingCheckRules: [], failedRules: [] },
    personalizedExplanation: "You are browsing the scheme knowledge base.",
    keyBenefitHighlight: selectedScheme.tagline || "",
    recommendedNextStep: "Complete the assessment for a personalized evaluation."
  } as SchemeMatchResult : null;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '3rem 2rem', width: '100%' }}>
      {/* Hero Section */}
      <div style={{ marginBottom: '3rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          Explore Government Schemes
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '800px', marginBottom: '2rem' }}>
          Discover verified government financial assistance, credit, subsidies, and entrepreneurship programmes matched to real eligibility criteria.
        </p>
        
        {/* Live Statistics */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <StatBox value={stats.total} label="TOTAL SCHEMES" />
          <StatBox value={stats.withFunding} label="WITH FINANCIAL SUPPORT" />
          <StatBox value={stats.verified} label="VERIFIED / SOURCED" />
          <StatBox value={stats.withEligibility} label="ELIGIBILITY DATA" />
        </div>
      </div>

      {/* Controls Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
        {/* Search */}
        <div style={{ position: 'relative', maxWidth: '600px' }}>
          <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
          <Input 
            placeholder="Search schemes by name, ministry, sector, or keyword..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '3rem', height: '3.5rem', fontSize: '1.1rem' }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
            <Filter size={18} />
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Filters:</span>
          </div>
          
          <select 
            className="schemora-select"
            value={selectedMinistry} 
            onChange={(e) => setSelectedMinistry(e.target.value)}
          >
            <option value="All">Ministry</option>
            {ministries.filter(m => m !== 'All').map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          <select 
            className="schemora-select"
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">Category</option>
            {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select 
            className="schemora-select"
            value={selectedSector} 
            onChange={(e) => setSelectedSector(e.target.value)}
          >
            <option value="All">Sector</option>
            {sectors.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Sort by:</span>
            <select 
              className="schemora-select"
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="funding-desc">Max Funding</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {filteredSchemes.length} {filteredSchemes.length === 1 ? 'Scheme' : 'Schemes'} Found
        </h2>
        {(searchTerm || selectedCategory !== 'All' || selectedSector !== 'All' || selectedMinistry !== 'All') && (
          <button 
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
              setSelectedSector('All');
              setSelectedMinistry('All');
            }}
            style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Grid */}
      {filteredSchemes.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '2rem' }}>
          {filteredSchemes.map(scheme => (
            <Card key={scheme.id} style={{ display: 'flex', flexDirection: 'column' }}>
              <CardHeader style={{ paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <Badge variant="neutral" style={{ maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {scheme.ministry || 'Government of India'}
                  </Badge>
                  <ConfidenceBadge state={scheme.needsVerification ? "needsInfo" : "matched"} />
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: '1.3' }}>
                  {scheme.name}
                </h3>
              </CardHeader>

              <CardContent style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {scheme.purpose || scheme.description || 'Information not available in the current SCHEMORA dataset.'}
                </p>

                {/* Quick Insights Matrix */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: 'auto', backgroundColor: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  
                  {/* Funding */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <IndianRupee size={16} style={{ color: 'var(--accent)', marginTop: '2px' }} />
                    <div style={{ fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Funding / Assistance</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        {scheme.maxFundingAmount ? `Up to ${formatINR(scheme.maxFundingAmount)}` : (scheme.subsidyRules ? 'Subsidy Support Available' : 'Funding information unavailable')}
                      </span>
                    </div>
                  </div>

                  {/* Target Beneficiaries */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <Briefcase size={16} style={{ color: 'var(--accent)', marginTop: '2px' }} />
                    <div style={{ fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Target Profile</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        {scheme.whoItIsFor || (scheme.categoryTags && scheme.categoryTags.length > 0 ? scheme.categoryTags.join(', ') : 'Broad Eligibility')}
                      </span>
                    </div>
                  </div>

                  {/* Sectors */}
                  {scheme.sectors && scheme.sectors.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <Building size={16} style={{ color: 'var(--accent)', marginTop: '2px' }} />
                      <div style={{ fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Sectors</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                          {scheme.sectors.slice(0, 3).join(', ')}{scheme.sectors.length > 3 ? '...' : ''}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

              </CardContent>

              <CardFooter style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                <Button 
                  variant="primary" 
                  fullWidth 
                  onClick={() => setSelectedScheme(scheme)}
                >
                  View Details &rarr;
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '6rem 2rem', backgroundColor: 'var(--bg-panel)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-strong)' }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
            <Search size={48} style={{ opacity: 0.5, margin: '0 auto' }} />
          </div>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No schemes match your current filters</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Try adjusting your search terms or clearing the selected filters.</p>
          <Button variant="outline" onClick={() => { setSearchTerm(''); setSelectedCategory('All'); setSelectedSector('All'); setSelectedMinistry('All'); }}>
            Clear all filters
          </Button>
        </div>
      )}

      {/* Detail Modal */}
      {dummyResultForModal && (
        <SchemeDetailModal 
          result={dummyResultForModal} 
          onClose={() => setSelectedScheme(null)} 
        />
      )}
      
      {/* Global styles for select */}
      <style dangerouslySetInnerHTML={{__html: `
        .schemora-select {
          appearance: none;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-medium);
          color: var(--text-primary);
          padding: 0.5rem 2rem 0.5rem 1rem;
          border-radius: var(--radius-sm);
          font-family: inherit;
          font-size: 0.9rem;
          cursor: pointer;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 0.5rem center;
          background-size: 1em;
        }
        .schemora-select:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 1px var(--accent);
        }
      `}} />
    </div>
  );
}

function StatBox({ value, label }: { value: number; label: string }) {
  return (
    <div style={{ 
      backgroundColor: 'var(--bg-panel)', 
      padding: '1.25rem', 
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border-subtle)',
      flex: '1 1 200px'
    }}>
      <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '0.5rem', letterSpacing: '0.05em' }}>
        {label}
      </div>
    </div>
  );
}
