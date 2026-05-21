---
title: "Logistics & Technology Disruption Report – Mobile Ordering Rollout, North Cohort"
type: logistics_disruption_report
region: National / North England
month: March 2024
tags: [mobile ordering, POS integration, logistics, NorthBrew Supplies, GreenLeaf Provisions, IT, Manchester, Leeds, rollout]
---

# Logistics & Technology Disruption Report
**Subject:** Mobile Ordering Rollout – North Cohort / Concurrent Supply Chain Disruption  
**Prepared by:** Operations Integration Team – Lena Frost  
**Date:** 28 March 2024  
**Distribution:** Head of Operations, Regional Managers, IT Lead, Supply Chain Lead

---

## Context

This report documents the operational disruptions associated with the Phase 1 mobile ordering rollout in the North England region (Manchester Piccadilly — launched 4 March; Leeds Central — launched 11 March) alongside the concurrent NorthBrew Supplies logistics failure. The overlap of these two events created compounding difficulties that are worth capturing in a single document for the purposes of the post-implementation review.

---

## Mobile Ordering Rollout – Summary

The BrewPulse mobile ordering system (developed on the Orda platform, integrated with our Square POS) was launched in the North cohort as the second wave of a national rollout following a successful pilot in Bristol and Edinburgh in January 2024.

### Manchester Piccadilly (Launch: 4 March)

Go-live was technically successful. Within three days, adoption reached 11% of daily transactions. However, two operational issues emerged within the first week:

**Issue 1 – Modifier Sync Failure**  
A bug in the POS integration caused drink modifiers — specifically milk alternative selections — to not carry through correctly from the app to the kitchen/bar display. Oat milk substitutions were the most commonly affected. Staff were receiving orders showing standard milk despite customers having selected oat. This led to re-makes and, in several cases, customer complaints about allergen-adjacent errors (though no clinical allergen incidents occurred).

The IT team was notified on 7 March. A fix was deployed on 18 March. The two-week lag between identification and resolution was due to a dependency on the Orda platform's release cycle — the fix required a patch from the third-party vendor, not just a configuration change on our side.

**Issue 2 – Training Readiness**  
Staff at Manchester Piccadilly received two hours of system training on 1 March, three days before launch. In retrospect, this was insufficient given the concurrent equipment concerns and staffing pressures at the branch. Duty manager James Rowley noted in his weekly report that "the team are managing but it's a lot to absorb at once, especially with the machine issues still unresolved."

### Leeds Central (Launch: 11 March)

Leeds Central's launch was deliberately delayed by one week from the original plan (4 March) due to the branch's staffing situation and the ongoing Bar 2 machine fault. This was the correct decision. Even with the delay, the launch coincided with a difficult period — the oat milk shortfall had only partially resolved, and one of the two barista vacancies remained unfilled.

Mobile ordering adoption at Leeds Central reached 9% by end of March, below the 15% target for week three. Customer feedback suggests some users abandoned the app after experiencing the wait time issues in early March (related to equipment, not the app itself) and attributed the delay to the new ordering channel.

---

## Supply Chain Disruption – Interaction with Rollout

The NorthBrew Supplies oat milk shortfall (documented separately by Dominic Ferrara) directly worsened the mobile ordering experience at both branches. Because oat milk was unavailable for portions of the first two weeks, customers placing mobile orders for oat-based drinks arrived to find their order could not be fulfilled as submitted. This created a confusing situation where staff had to explain both the product unavailability and the new system's limitations simultaneously.

At Leeds Central, two customers who had placed mobile orders for oat flat whites during the shortfall period submitted formal complaints. One explicitly stated she believed the app had "taken her money for a drink they knew they couldn't make." Refunds were processed but the reputational impact (one complaint was posted on Google Reviews) was noted.

---

## Learnings and Recommendations

1. **Do not overlap technology rollouts with known operational stress periods.** The North cohort launched during an active supplier disruption and with branches carrying equipment faults. This should have triggered a rollout deferral.

2. **Modifier sync testing must include milk alternatives.** The oat milk bug was not caught in UAT because the test scripts did not include oat milk as a modifier combination. Test coverage must be expanded before the next wave (Midlands cohort, planned May 2024).

3. **Staff training should be minimum four hours** with a follow-up session one week post-launch. The Bristol/Edinburgh pilot used a four-hour model and reported significantly lower post-launch complaints.

4. **Real-time menu availability sync** — the app should reflect live stock status. If oat milk is unavailable, the menu item should be greyed out. This feature is on the product roadmap but not yet implemented.

5. **Supply chain status should be a go/no-go criterion for rollout.** If a branch is experiencing a confirmed supply disruption, launch should be paused.

---

## Status of North Cohort Rollout

As of 28 March, both Manchester Piccadilly and Leeds Central are live. The modifier bug is resolved. Adoption is trending upward. The recommendation is to proceed with the Midlands cohort in May 2024 but to apply the learnings above before launch.

---
*Classification: Internal – Operations / IT*
