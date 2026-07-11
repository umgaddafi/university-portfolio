import React from 'react';

interface PartAPrintLayoutProps {
  formData: any;
}

export const PartAPrintLayout: React.FC<PartAPrintLayoutProps> = ({ formData }) => {
  const d = formData?.partA || {};
  const pB = formData?.partB || {};
  const pC = formData?.partC || {};
  const v = (val: any) => val ? val : "Nil";

  const calculateAge = (dob: string) => {
    if (!dob) return "Nil";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="print-container text-black font-serif text-[12pt] leading-tight">
      {/* Page 1 */}
      <div className="page mb-8">
        <div className="text-center font-bold mb-4 uppercase">
          <div>JOSEPH SARWUAN TARKA UNIVERSITY</div>
          <div>P.M.B. 2373, MAKURDI</div>
          <div className="italic text-[11pt] font-normal">(Office of the Registrar: Directorate of Personnel Affairs, Senior Staff Establishment)</div>
          <div className="italic text-[11pt] font-bold">(Form ASAP 1)</div>
        </div>

        <div className="space-y-3 mb-6 font-bold">
          <div className="flex"><span className="w-48">PERSONAL FILE NUMBER:</span> <span className="flex-1 border-b border-black border-dotted">{v(d.file_number)}</span></div>
          <div className="flex"><span className="w-48">COLLEGE:</span> <span className="flex-1 border-b border-black border-dotted">{v(d.college)}</span></div>
          <div className="flex"><span className="w-48">DEPARTMENT:</span> <span className="flex-1 border-b border-black border-dotted">{v(d.department)}</span></div>
        </div>

        <div className="text-center font-bold mb-6">
          <div className="uppercase">ANNUAL PERFORMANCE EVALUATION REPORT</div>
          <div className="italic text-[11pt] font-normal">(Administrative/Professional/Non-Teaching Staff Only)</div>
        </div>

        <div className="flex gap-4 mb-4">
          <div className="font-bold w-16">PART A:</div>
          <div>
            <div>(To be completed by staff concerned)</div>
            <div>Period of Report: <span className="font-bold border-b border-black">From October 2025 to September 2026</span></div>
          </div>
        </div>

        <div className="space-y-4">
          {/* 1. Name */}
          <div className="flex">
            <div className="w-8">1.</div>
            <div className="flex-1 flex gap-2 items-end">
              <span>Name:</span>
              <div className="flex-1 text-center border-b border-black border-dotted">{v(d.name)}</div>
            </div>
          </div>

          {/* 2 & 3 */}
          <div className="flex">
            <div className="w-8">2.</div>
            <div className="flex-1 flex gap-2 items-end">
              <span>Age Last Birthday:</span>
              <span className="w-32 text-center border-b border-black border-dotted">{calculateAge(d.date_of_birth)}</span>
              <span className="w-8 ml-4">3.</span>
              <span>Date of Birth:</span>
              <span className="flex-1 text-center border-b border-black border-dotted">{v(d.date_of_birth)}</span>
            </div>
          </div>

          {/* 4 */}
          <div className="flex">
            <div className="w-8">4.</div>
            <div className="flex-1 flex gap-2 items-end">
              <span>Marital Status</span>
              <span className="w-48 text-center border-b border-black border-dotted">{v(d.marital_status)}</span>
              <span>Tel. No(s):</span>
              <span className="flex-1 text-center border-b border-black border-dotted">{v(d.phone)}</span>
            </div>
          </div>

          {/* 5. Institutions */}
          <div className="flex mt-6">
            <div className="w-8">5.</div>
            <div className="flex-1">
              <div className="flex font-bold mb-2">
                <div className="w-1/2">Institutions Attended</div>
                <div className="w-1/4">Qualifications Obtained</div>
                <div className="w-1/4 text-center">Date</div>
              </div>
              {[0, 1, 2, 3, 4].map(i => {
                const inst = d.institutions && d.institutions[i];
                const qual = d.qualifications && d.qualifications[i];
                return (
                  <div key={i} className="flex mb-2">
                    <div className="w-8">{['i', 'ii', 'iii', 'iv', 'v'][i]}.</div>
                    <div className="w-[calc(50%-2rem)] border-b border-black border-dotted px-2">{inst ? inst.text : "Nil"}</div>
                    <div className="w-1/4 border-b border-black border-dotted px-2">{qual ? `${qual.subtype} ${qual.text}` : "Nil"}</div>
                    <div className="w-1/4 border-b border-black border-dotted px-2 text-center">{qual ? qual.end : "Nil"}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 6. Previous Employment */}
          <div className="mt-6">
            <div className="flex mb-2 font-bold">
              <div className="w-8">6.</div>
              <div>Previous Employment History before joining JOSTUM:</div>
            </div>
            <table className="w-full border-collapse border border-black text-[11pt]">
              <thead>
                <tr>
                  <th className="border border-black p-1 text-left">Employer</th>
                  <th className="border border-black p-1 text-left">Post Held</th>
                  <th className="border border-black p-1 text-left">Last Income p.a./Date Left</th>
                  <th className="border border-black p-1 text-left">Reason for Leaving</th>
                </tr>
              </thead>
              <tbody>
                {[0, 1, 2, 3].map(i => {
                   const emp = d.previous_employment && d.previous_employment[i];
                   return (
                     <tr key={i}>
                       <td className="border border-black p-1 h-8">{emp ? emp.text : "Nil"}</td>
                       <td className="border border-black p-1">{emp ? emp.subtype : "Nil"}</td>
                       <td className="border border-black p-1">{emp ? `${emp.income} / ${emp.end}` : "Nil"}</td>
                       <td className="border border-black p-1">{emp ? emp.reason : "Nil"}</td>
                     </tr>
                   )
                })}
              </tbody>
            </table>
          </div>

          {/* 7 */}
          <div className="space-y-4 mt-6">
            <div className="flex">
              <div className="w-12">7(a).</div>
              <div className="flex-1 flex items-end">
                <span>Date of First Appointment:</span>
                <span className="flex-1 ml-2 border-b border-black border-dotted text-center">{v(d.date_of_first_appointment)}</span>
              </div>
            </div>
            <div className="flex">
              <div className="w-12">(b)</div>
              <div className="flex-1 flex items-end">
                <span>Date of Transfer of Service:</span>
                <span className="flex-1 ml-2 border-b border-black border-dotted text-center">{v(d.date_of_transfer)}</span>
              </div>
            </div>
            <div className="flex">
              <div className="w-12">(c)</div>
              <div className="flex-1 flex items-end">
                <span>Date of Assumption of Duty in JOSTUM:</span>
                <span className="flex-1 ml-2 border-b border-black border-dotted text-center">{v(d.date_assumed_duty)}</span>
              </div>
            </div>
          </div>

          {/* 8 */}
          <div className="flex mt-4">
            <div className="w-8">8.</div>
            <div className="flex-1 flex items-end">
              <span>Rank on First Appointment in JOSTUM:</span>
              <span className="flex-1 ml-2 border-b border-black border-dotted text-center">{v(d.rank_on_first_appointment)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="page mb-8">
        <div className="space-y-4">
          <div className="flex">
            <div className="w-8">9.</div>
            <div className="flex-1 flex items-end">
              <span>Date of Confirmation of Appointment:</span>
              <span className="flex-1 ml-2 border-b border-black border-dotted text-center">{v(d.date_confirmed)}</span>
            </div>
          </div>
          <div className="flex">
            <div className="w-8">10.</div>
            <div className="flex-1 flex items-end">
              <span>Date of Last Promotion/Regrading/Conversion:</span>
              <span className="flex-1 ml-2 border-b border-black border-dotted text-center">{v(d.date_last_promoted)}</span>
            </div>
          </div>
          <div className="flex">
            <div className="w-8">11.</div>
            <div className="flex-1 flex items-end">
              <span>Present Rank:</span>
              <span className="flex-1 ml-2 border-b border-black border-dotted text-center">{v(d.present_rank)}</span>
            </div>
          </div>
          <div className="flex">
            <div className="w-8">12.</div>
            <div className="flex-1 flex items-end">
              <span>Present Salary/CONTISS:</span>
              <span className="flex-1 ml-2 border-b border-black border-dotted text-center">CONTISS {v(d.present_level)} / Step {v(d.present_step)}</span>
            </div>
          </div>

          {/* 13 */}
          <div className="mt-6">
            <div className="flex mb-2 font-bold">
              <div className="w-8">13.</div>
              <div>Dates of Last two (2) Promotions:</div>
            </div>
            <div className="pl-8">
              <table className="w-[90%] border-collapse border border-black text-[11pt]">
                <thead>
                  <tr>
                    <th className="border border-black p-1 text-left w-1/3">Date of Promotion</th>
                    <th className="border border-black p-1 text-left w-1/3">Position to which Promoted</th>
                    <th className="border border-black p-1 text-left w-1/3">Salary/Scale</th>
                  </tr>
                </thead>
                <tbody>
                  {[0, 1].map(i => {
                    const p = d.last_two_promotions && d.last_two_promotions[i];
                    return (
                      <tr key={i}>
                        <td className="border border-black p-1 h-8">{p && p.start ? p.start : "Nil"}</td>
                        <td className="border border-black p-1">{p && p.text ? p.text : "Nil"}</td>
                        <td className="border border-black p-1">{p && p.income ? p.income : "Nil"}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 14 */}
          <div className="flex mt-6">
            <div className="w-8">14.</div>
            <div className="flex-1">
              <div className="mb-2">Present Schedule of Duty (to be stated clearly and fully):</div>
              <div className="border-b border-black border-dotted min-h-[1.5rem] leading-loose break-words whitespace-pre-wrap">
                {d.duties && d.duties.length > 0 ? d.duties.map((duty: any) => duty.text).join('\n') : "Nil"}
              </div>
            </div>
          </div>

          {/* 15 */}
          <div className="flex mt-6">
            <div className="w-8">15.</div>
            <div className="flex-1">
              <div className="mb-2">Have you held any acting appointment(s) during the period under review; if yes, in what position and for how long in each case?</div>
              <div className="border-b border-black border-dotted min-h-[1.5rem] leading-loose break-words whitespace-pre-wrap">
                {d.acting_appointments && d.acting_appointments.length > 0 
                  ? d.acting_appointments.map((a: any) => `${a.text} (${a.start} - ${a.end})`).join('\n') 
                  : "Nil"}
              </div>
            </div>
          </div>

          {/* 16 */}
          <div className="flex mt-6">
            <div className="w-8">16.</div>
            <div className="flex-1">
              <div className="mb-2">Examinations taken (with results) during the period under review (state date).</div>
              <div className="border-b border-black border-dotted min-h-[1.5rem] leading-loose break-words whitespace-pre-wrap">
                {d.examinations && d.examinations.length > 0 
                  ? d.examinations.map((a: any) => `${a.text} (Date: ${a.start})`).join('\n') 
                  : "Nil"}
              </div>
            </div>
          </div>

          {/* 17 */}
          <div className="flex mt-6">
            <div className="w-8">17.</div>
            <div className="flex-1">
              <div className="mb-2">Name any training course/workshop/seminar attended during the period under review (please attach appropriate evidence).</div>
              <div className="border-b border-black border-dotted min-h-[1.5rem] leading-loose break-words whitespace-pre-wrap">
                {d.training && d.training.length > 0 
                  ? d.training.map((a: any) => `${a.text} (${a.start} - ${a.end})`).join('\n') 
                  : "Nil"}
              </div>
            </div>
          </div>

          {/* 18 */}
          <div className="flex mt-8 font-bold">
            <div className="w-8">18.</div>
            <div className="flex-1">
              <div className="mb-4">Certification by Staff:</div>
              <div className="font-normal mb-6">I declare that the above information is true and correct.</div>
              <div className="space-y-4">
                <div className="flex items-end max-w-lg">
                  <span className="w-36">Signature of Staff:</span>
                  <span className="flex-1 border-b border-black border-dotted text-center font-normal">{d.declaration ? "Signed Digitally" : "Nil"}</span>
                </div>
                <div className="flex items-end max-w-lg">
                  <span className="w-36">Name:</span>
                  <span className="flex-1 border-b border-black border-dotted text-center font-normal">{v(d.declaration_name)}</span>
                </div>
                <div className="flex items-end max-w-lg">
                  <span className="w-36">Date:</span>
                  <span className="flex-1 border-b border-black border-dotted text-center font-normal">{v(d.declaration_date)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      {/* Part B & C (Printed if available) */}
      {Object.keys(pB).length > 0 && (
            <div className="page mt-12 mb-8">
              <div className="flex gap-4 mb-6">
                <div className="font-bold w-16">PART B:</div>
                <div>
                  <div className="font-bold border-b border-black uppercase">Supervisor's Assessment</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between font-bold text-[14pt] pt-4 border-b-2 border-black pb-2 mb-4">
                  <span>OVERALL ASSESSMENT SCORE:</span>
                  <span className="border-2 border-black px-4 bg-gray-100">
                    {Number(pB.basic_qualification||0) + Number(pB.additional_qualification||0) + Number(pB.work_experience||0) + Number(pB.quality_of_work||0) + Number(pB.quantity_of_work||0) + Number(pB.ability_to_work||0) + Number(pB.supervisory_ability||0) + Number(pB.experience||0) + Number(pB.punctuality||0) + Number(pB.care_of_property||0) + Number(pB.integrity||0) + Number(pB.initiative||0) + Number(pB.knowledge_regulations||0) + Number(pB.professional_membership||0)} / 100
                  </span>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="font-bold">Supervisor's Recommendation:</div>
                  <div className="border-b border-black border-dotted pb-1">{v(pB.recommendation)}</div>
                  
                  <div className="font-bold mt-4">Supervisor's General Comments:</div>
                  <div className="border-b border-black border-dotted pb-1 min-h-[3rem] whitespace-pre-wrap">{v(pB.comments)}</div>
                </div>
              </div>

              {Object.keys(pC).length > 0 && (
                <div className="mt-12">
                  <div className="flex gap-4 mb-4">
                    <div className="font-bold w-16">PART C:</div>
                    <div>
                      <div className="font-bold border-b border-black uppercase">Staff Acknowledgment</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-center mb-4">
                    <div className="font-bold">Agreement:</div>
                    <div className="flex gap-4">
                      <span>[{pC.agree === true ? '✓' : '   '}] I Agree</span>
                      <span>[{pC.agree === false ? '✓' : '   '}] I Disagree</span>
                    </div>
                  </div>

                  <div className="font-bold mt-4">Staff Comments / Reasons for Disagreement:</div>
                  <div className="border-b border-black border-dotted pb-1 min-h-[3rem] whitespace-pre-wrap">{v(pC.comments)}</div>
                  
                  <div className="flex justify-between mt-8">
                    <div className="text-center">
                      <div className="border-b border-black w-48 mb-1 uppercase font-bold">{v(d.name)}</div>
                      <div className="italic text-[10pt]">Staff Signature & Name</div>
                    </div>
                    <div className="text-center">
                      <div className="border-b border-black w-32 mb-1">Digitally Signed</div>
                      <div className="italic text-[10pt]">Date</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

    </div>
  );
};
