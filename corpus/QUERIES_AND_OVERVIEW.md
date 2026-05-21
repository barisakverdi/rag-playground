# BrewPulse Coffee – RAG Demo Dataset
## Suggested Queries & Dataset Overview

---

## Corpus Structure

```
/corpus
  01_north_regional_ops_report.md        → Regional Ops Report
  02_incident_leeds_espresso_failure.md  → Incident Report
  03_supplier_northbrew_oat_milk.md      → Supplier Update
  04_customer_feedback_north.md          → Customer Feedback Summary
  05_staffing_issues_north.md            → Staffing Issue Report
  06_maintenance_report_north.md         → Maintenance Report
  07_regional_performance_q1_north.md    → Regional Performance Summary
  08_logistics_mobile_ordering_disruption.md → Logistics Disruption Report
```

---

## Suggested Queries (RAG Demo Questions)

These questions require semantic retrieval across multiple documents. None can be answered from a single file.

### Supplier & Supply Chain

1. Which operational issues were directly caused or worsened by the NorthBrew Supplies disruption?
2. What branches were affected by the oat milk shortage, and what were the downstream consequences at each?
3. Has NorthBrew Supplies caused supply problems before, and how does the March 2024 situation compare?
4. What steps has BrewPulse taken to reduce dependency on NorthBrew Supplies?

### Equipment & Maintenance

5. Which branches experienced espresso machine failures, and what is the common root cause?
6. What is the relationship between the Leeds Central and Manchester Piccadilly equipment faults?
7. Are the espresso machine issues at Leeds and Manchester likely to recur at other branches?
8. What maintenance actions are currently outstanding and which carry the highest operational risk?

### Mobile Ordering Rollout

9. What problems emerged after the mobile ordering system launched in North England?
10. Why did the oat milk ordering bug take two weeks to fix, and what was the customer impact?
11. How did the timing of the mobile ordering rollout interact with other operational problems?
12. What should be done differently before the Midlands cohort rollout in May?

### Staffing

13. Which branches had staffing shortages in Q1 2024, and what caused them?
14. How did understaffing at Leeds Central compound the impact of the equipment failure?
15. What is the risk to Easter trading given current headcount levels?

### Customer Experience

16. Which cities mentioned both staffing shortages and customer complaints in the same period?
17. What is the connection between the espresso machine fault and the specific customer complaints about drink quality?
18. Which customer complaints can be traced back to a supplier issue rather than a branch-level failure?

### Cross-Document Reasoning

19. If you were the Head of Operations reviewing Q1 2024, what would you identify as the single most important systemic risk to address?
20. Trace the full chain of events from the NorthBrew Supplies Wakefield depot failure through to the Google Reviews complaints at Leeds Central.

---

## Entity Cross-Reference Map

| Entity | Files Referenced |
|--------|-----------------|
| NorthBrew Supplies | 01, 03, 04, 07, 08 |
| Sarah Mitchell | 01, 02, 03, 05, 06, 07 |
| Leeds Central | 01, 02, 03, 04, 05, 06, 07, 08 |
| Manchester Piccadilly | 01, 04, 06, 07, 08 |
| Espresso machine failures | 01, 02, 04, 06, 07 |
| Oat milk shortages | 01, 02, 03, 04, 07, 08 |
| Mobile ordering rollout | 01, 04, 05, 07, 08 |
| Staffing shortages | 01, 04, 05, 07 |
| Marcus Webb | 02, 06 |
| James Rowley | 01, 08 |
| Amara Osei | 04, 07 |
| Dominic Ferrara | 03, 07, 08 |

---

## Retrieval Challenge Design Notes

The dataset is designed to exhibit the following RAG-relevant properties:

- **Indirect references:** The customer complaint about "watery espresso" in file 04 is never explicitly linked to the valve failure — the retrieval system must connect these.
- **Causal chains:** Wakefield depot failure → oat milk shortfall → mobile order cannot be fulfilled → Google Review complaint. Spans files 03 → 08 → 04.
- **Ambiguous attribution:** Some complaints could be attributed to the app, the supplier, or the equipment. Retrieval + reasoning needed to disambiguate.
- **Timeline references:** Events in February cause consequences reported in March. Reports written at different times reference the same incidents with different levels of detail.
- **Partial information:** No single document contains the full picture. File 02 describes the Leeds equipment fault; file 06 adds the Manchester connection; file 07 adds the performance impact.
- **Named entities as connectors:** Sarah Mitchell, NorthBrew Supplies, and the La Marzocca Linea PB model name all act as retrieval anchors connecting multiple documents.

---
*BrewPulse Coffee – Internal RAG Demo Dataset v1.0*
