import React from 'react';
import { ArrowLeft, FilePlus2, History, Paperclip, Target } from 'lucide-react';
import type { Disbursement, Project, ProjectStatus, WithdrawalApplication } from '../types/api';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ProgressBar } from './ui/progress';
import { Stepper } from './ui/stepper';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { PROJECT_STATUS_TONE, WITHDRAWAL_STATUS_TONE } from '../lib/status';
import { SECTOR_BADGE_CLASSES } from '../lib/sector';

const LIFECYCLE_STAGES: ProjectStatus[] = ['Concept', 'Appraisal', 'Negotiation', 'BoardApproval', 'Active', 'Closed'];

interface ProjectDetailViewProps {
  project: Project;
  withdrawals: WithdrawalApplication[];
  disbursements: Disbursement[];
  onBack: () => void;
  onSubmitWithdrawal: () => void;
  onShowHistory: (w: WithdrawalApplication) => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  project: p,
  withdrawals,
  disbursements,
  onBack,
  onSubmitWithdrawal,
  onShowHistory,
}) => {
  const pct = p.approvedAmount > 0 ? Math.round((p.totalDisbursed / p.approvedAmount) * 100) : 0;

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Projects
      </button>

      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <Badge variant="muted">{p.financingInstrument}</Badge>
              <Badge variant="muted" className={SECTOR_BADGE_CLASSES[p.sector]}>{p.sector}</Badge>
              <Badge variant={PROJECT_STATUS_TONE[p.status] ?? 'default'}>{p.status}</Badge>
            </div>
            <h1 className="text-2xl font-bold leading-tight text-foreground">{p.title}</h1>
          </div>
          {p.status === 'Active' && (
            <Button onClick={onSubmitWithdrawal}>
              <FilePlus2 className="h-4 w-4" />
              Submit Withdrawal
            </Button>
          )}
        </div>

        <p className="mt-3 max-w-3xl text-sm text-muted-foreground">{p.projectDevelopmentObjective}</p>

        <div className="my-5 overflow-x-auto">
          <Stepper stages={LIFECYCLE_STAGES} currentIndex={LIFECYCLE_STAGES.indexOf(p.status)} />
        </div>

        <div className="space-y-1.5">
          <div className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs text-muted-foreground">
            <span>Ceiling: <strong className="text-foreground">${p.approvedAmount.toLocaleString()}</strong></span>
            <span>Disbursed: <strong className="text-emerald-400">${p.totalDisbursed.toLocaleString()} ({pct}%)</strong></span>
            <span>Pending: <strong className="text-amber-400">${p.committedPendingDisbursement.toLocaleString()}</strong></span>
            <span>Remaining: <strong className="text-sky-400">${p.remainingUndisbursedAmount.toLocaleString()}</strong></span>
          </div>
          <ProgressBar percent={pct} />
        </div>
      </Card>

      {p.resultsIndicators.length > 0 && (
        <div>
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Target className="h-4 w-4" /> Results Indicators (PDO)
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {p.resultsIndicators.map((ind) => (
              <Card key={ind.id} className="p-4">
                <h4 className="text-sm font-semibold text-foreground">{ind.indicatorName}</h4>
                <div className="my-3 grid grid-cols-3 gap-2 font-mono text-xs">
                  <div>
                    <div className="text-[10px] text-muted-foreground">Baseline</div>
                    <div className="text-foreground">{ind.baselineValue.toLocaleString()} {ind.unit}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">Current</div>
                    <div className="text-sky-400">{ind.currentValue.toLocaleString()} {ind.unit}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">Target</div>
                    <div className="text-emerald-400">{ind.targetValue.toLocaleString()} {ind.unit}</div>
                  </div>
                </div>
                <ProgressBar percent={ind.progressPercent} tone="sky" />
                <div className="mt-1.5 text-[11px] text-muted-foreground">{ind.progressPercent}% toward PDO target</div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-2 text-sm font-semibold text-foreground">Withdrawal Applications ({withdrawals.length})</h2>
        <Card>
          <CardContent className="overflow-x-auto p-4">
            {withdrawals.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">No Withdrawal Applications submitted for this project yet.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>WA Number</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Documentation</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>History</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.map((w) => (
                    <TableRow key={w.id}>
                      <TableCell className="font-mono text-foreground">{w.applicationNumber}</TableCell>
                      <TableCell><Badge variant="muted">{w.category}</Badge></TableCell>
                      <TableCell className="font-mono">${w.amountRequested.toLocaleString()}</TableCell>
                      <TableCell><Badge variant={WITHDRAWAL_STATUS_TONE[w.status] ?? 'default'}>{w.status}</Badge></TableCell>
                      <TableCell className="max-w-[220px]">
                        <div className="truncate text-xs">{w.supportingDocumentsNote}</div>
                        {w.documents.length > 0 && (
                          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Paperclip className="h-3 w-3" /> {w.documents.length} file{w.documents.length > 1 ? 's' : ''}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{new Date(w.submittedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => onShowHistory(w)}>
                          <History className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-foreground">Disbursement Ledger ({disbursements.length})</h2>
        <Card>
          <CardContent className="overflow-x-auto p-4">
            {disbursements.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">No disbursements recorded for this project yet.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction Ref</TableHead>
                    <TableHead>WA Number</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Balance After</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {disbursements.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-mono text-muted-foreground">{d.transactionReference}</TableCell>
                      <TableCell>{d.applicationNumber}</TableCell>
                      <TableCell className="text-right font-mono text-emerald-400">+${d.amountDisbursed.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono text-sky-400">${d.designatedAccountBalanceAfter.toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground">{new Date(d.disbursedAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
