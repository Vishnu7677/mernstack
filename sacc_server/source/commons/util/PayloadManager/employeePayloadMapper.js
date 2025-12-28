/**
 * Utility to map Frontend Payload to Mongoose EmploymentProfile Schema
 * Prevents validation errors by normalizing data types and nesting structures.
 */

// =========================
// HELPERS (Defined inside or imported)
// =========================

function normalizeEducationLevel(level) {
  const map = {
    '10th': '10th',
    '12th': '12th',
    'Intermediate/12th': '12th',
    'Degree/Diploma': 'Degree',
    'Post Graduation': 'Post Graduation'
  };
  return map[level] || level;
}

function normalizePfType(type) {
  if (!type) return 'not_applicable';
  if (type === 'Existing UAN') return 'existing';
  if (type === 'New UAN Required') return 'new_required';
  return 'not_applicable';
}

function calculateYears(emp) {
  if (!emp?.fromDate || !emp?.toDate) return 0;
  const diff = new Date(emp.toDate) - new Date(emp.fromDate);
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  return years > 0 ? years : 0;
}

function calculateMonths(emp) {
  if (!emp?.fromDate || !emp?.toDate) return 0;
  const diff = new Date(emp.toDate) - new Date(emp.fromDate);
  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44));
  return months % 12;
}

// =========================
// MAIN EXPORT
// =========================

module.exports.mapEmployeePayload = function (body) {
  
  // Helper to ensure Address fields are objects (for Mixed schema types)
  const formatAddress = (addr) => {
    if (!addr) return {};
    return typeof addr === 'string' ? { fullAddress: addr } : addr;
  };

  // Helper to normalize document entries (Handles current Boolean and future String URLs)
  const normalizeDoc = (val) => {
    if (typeof val === 'boolean') return { uploaded: val, url: null };
    if (typeof val === 'string' && val.trim() !== "") return { uploaded: true, url: val };
    if (val && typeof val === 'object') return { uploaded: !!val.uploaded, url: val.url || null };
    return { uploaded: false, url: null };
  };

  // Helper for safe Date parsing
  const parseDate = (d) => {
    if (!d || d === "") return null;
    const parsed = new Date(d);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  return {
    // =========================
    // PERSONAL INFO
    // =========================
    personalInfo: {
      fatherName: body.fathers_name || body.fathersName,
      motherName: body.mothers_name || body.mothersName,
      spouseName: body.spouse_name || body.spouseName,
      bloodGroup: body.blood_group || body.bloodGroup,
      maritalStatus: body.marital_status || body.maritalStatus,
      panNumber: body.pan_number || body.panNumber,
      nationality: body.nationality || 'Indian',
      alternateMobile: body.alternate_mobile || body.alternateMobile,
      permanentAddress: formatAddress(body.permanent_address),
      currentAddress: formatAddress(body.present_address || body.presentAddress),
      emergencyContact: {
        name: body.emergency_contact?.name || body.emergencyName || "",
        relationship: body.emergency_contact?.relationship || body.emergencyRelationship || "",
        phone: body.emergency_contact?.phone || body.emergencyPhone || ""
      }
    },

    // =========================
    // EDUCATION
    // =========================
    education: (body.qualifications || []).map(q => ({
      level: normalizeEducationLevel(q.level),
      institution: q.institution || "",
      boardOrUniversity: q.board || "",
      yearOfPassing: q.year ? Number(q.year) : null,
      percentageOrGrade: q.grade || "",
      specialization: q.specialization || ""
    })),

    // =========================
    // WORK EXPERIENCE
    // =========================
    workExperience: {
      totalYears: calculateYears(body.current_employer),
      totalMonths: calculateMonths(body.current_employer),
      history: body.previously_worked
        ? [{
            companyName: body.current_employer?.companyName || "",
            designation: body.current_employer?.designation || "",
            fromDate: parseDate(body.current_employer?.fromDate),
            toDate: parseDate(body.current_employer?.toDate),
            isCurrent: true,
            lastCTC: body.current_employer?.lastCTC || "",
            reasonForLeaving: body.current_employer?.reasonForLeaving || ""
          },
          ...(body.previous_employers || []).map(exp => ({
            companyName: exp.companyName,
            designation: exp.position || exp.designation,
            fromDate: parseDate(exp.fromDate),
            toDate: parseDate(exp.toDate),
            isCurrent: false,
            lastCTC: exp.lastCTC || "",
            reasonForLeaving: exp.reasonForLeaving || ""
          }))
        ]
        : []
    },

    // =========================
    // SKILLS
    // =========================
    skills: {
      technical: body.technical_skills || body.technicalSkills || [],
      tools: body.software_tools || body.softwareTools || [],
      languages: body.other_skills || body.otherSkills || []
    },

    // =========================
    // BANK DETAILS
    // =========================
    bankDetails: {
      accountHolderName: body.bank_account_holder || body.bankAccountHolder || "",
      bankName: body.bank_name || body.bankName || "",
      accountNumber: body.account_number || body.accountNumber || "",
      ifscCode: body.ifsc_code || body.ifscCode || "",
      branchName: body.branch_name || body.branchName || ""
    },

    // =========================
    // PF DETAILS
    // =========================
    pfDetails: {
      uanNumber: body.uan_number || body.uanNumber || "",
      pfType: normalizePfType(body.pf_type || body.pfType),
      previousExitDate: parseDate(body.previous_pf_exit_date || body.previousPFExitDate)
    },

    // =========================
    // ESI DETAILS
    // =========================
    esiDetails: {
      esiNumber: body.esi_number || body.esiNumber || "",
      isRegistered: (body.esi_status || body.esiStatus) === 'Registered'
    },

    // =========================
    // DOCUMENTS (Normalized Checklist)
    // =========================
    documents: {
      aadhaarCard: normalizeDoc(body.documents?.aadhaarCard),
      panCard: normalizeDoc(body.documents?.panCard),
      educationCertificates: normalizeDoc(body.documents?.tenthCertificate || body.documents?.interDegreeCertificates),
      experienceLetters: normalizeDoc(body.documents?.experienceLetter),
      paySlips: normalizeDoc(body.documents?.salarySlips),
      bankPassbook: normalizeDoc(body.documents?.bankPassbook),
      photo: normalizeDoc(body.documents?.passportPhotos),
      resume: normalizeDoc(body.documents?.updatedResume)
    },

    joiningDate: parseDate(body.join_date || body.joinDate) || new Date()
  };
};