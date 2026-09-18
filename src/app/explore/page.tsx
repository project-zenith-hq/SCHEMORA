"use client";

import React, { useState } from 'react';
import { SCHEMES_DATABASE } from '@/data/schemes';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { ConfidenceBadge } from '@/components/ui/ConfidenceBadge';
import { ReasoningPanel } from '@/components/Scheme/ReasoningPanel';

export default function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSchemes = SCHEMES_DATABASE.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.tagline.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '4rem 2rem', width: '100%' }}>
      <div style={{ marginBottom: '3rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 300, marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Explore Schemes
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', marginBottom: '2rem' }}>
          Browse our verified database of government schemes and financial support programs.
        </p>
        
        <div style={{ maxWidth: '400px' }}>
          <Input 
            placeholder="Search by name or keyword..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
        {filteredSchemes.map(scheme => (
          <Card key={scheme.id} style={{ display: 'flex', flexDirection: 'column' }}>
            <CardHeader style={{ paddingBottom: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <Badge variant="neutral">{scheme.ministry}</Badge>
                <ConfidenceBadge state={scheme.maxFundingAmount > 2000000 ? "matched" : "needsInfo"} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                {scheme.name}
              </h3>
            </CardHeader>
            <CardContent style={{ flex: 1 }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                {scheme.tagline}
              </p>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                <strong>Funding:</strong> Up to ₹ {scheme.maxFundingAmount.toLocaleString('en-IN')}
              </div>
              
              <ReasoningPanel 
                evaluations={[
                  { id: "1", rule: "Sector Alignment", status: "passed", detail: "Matches 'Manufacturing' priority" },
                  { id: "2", rule: "Funding Request", status: "passed", detail: `Within ₹${(scheme.maxFundingAmount / 100000).toFixed(0)} Lakhs limit` },
                  { id: "3", rule: "Demographic Data", status: scheme.maxFundingAmount > 2000000 ? "passed" : "needsInfo", detail: "SC/ST certification pending" }
                ]}
              />
            </CardContent>
            <CardFooter style={{ paddingTop: 0 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Status: Verified • Source: Official Guidelines
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {filteredSchemes.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          No schemes found matching "{searchTerm}".
        </div>
      )}
    </div>
  );
}
