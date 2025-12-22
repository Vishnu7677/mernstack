module.exports.mapEmployeePayload = function (body) {
    return {
      // =========================
      // PERSONAL INFO
      // =========================
      personalInfo: {
        fatherName: body.fathers_name,
        motherName: body.mothers_name,
        spouseName: body.spouse_name,
        bloodGroup: body.blood_group,
        maritalStatus: body.marital_status,
        permanentAddress: body.permanent_address || {},
        currentAddress: body.present_address || {},
        emergencyContact: body.emergency_contact || {}
      },
  
      // =========================
      // EDUCATION
      // =========================
      education: (body.qualifications || []).map(q => ({
        level: normalizeEducationLevel(q.level),
        institution: q.institution,
        boardOrUniversity: q.board,
        yearOfPassing: Number(q.year),
        percentageOrGrade: q.grade,
        specialization: q.specialization
      })),
  
      // =========================
      // WORK EXPERIENCE
      // =========================
      workExperience: {
        totalYears: calculateYears(body.current_employer),
        totalMonths: calculateMonths(body.current_employer),
        history: body.previously_worked
          ? [{
              companyName: body.current_employer?.companyName,
              designation: body.current_employer?.designation,
              fromDate: body.current_employer?.fromDate,
              toDate: body.current_employer?.toDate,
              isCurrent: true,
              lastCTC: body.current_employer?.lastCTC,
              reasonForLeaving: body.current_employer?.reasonForLeaving
            }]
          : []
      },
  
      // =========================
      // SKILLS
      // =========================
      skills: {
        technical: body.technical_skills || [],
        tools: body.software_tools || [],
        languages: body.other_skills || []
      },
  
      // =========================
      // BANK DETAILS
      // =========================
      bankDetails: {
        accountHolderName: body.bank_account_holder,
        bankName: body.bank_name,
        accountNumber: body.account_number,
        ifscCode: body.ifsc_code,
        branchName: body.branch_name
      },
  
      // =========================
      // PF DETAILS
      // =========================
      pfDetails: {
        uanNumber: body.uan_number,
        pfType: normalizePfType(body.pf_type),
        previousExitDate: body.previous_pf_exit_date
      },
  
      // =========================
      // ESI DETAILS
      // =========================
      esiDetails: {
        esiNumber: body.esi_number,
        isRegistered: body.esi_status === 'Registered'
      },
  
      // =========================
      // DOCUMENTS
      // =========================
      documents: Object.entries(body.documents || {}).reduce((acc, [key, value]) => {
        acc[key] =
          typeof value === 'boolean'
            ? { uploaded: value }
            : value;
        return acc;
      }, {}),
  
      joiningDate: body.join_date || new Date()
    };
  };
  
  // =========================
  // HELPERS
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
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
  }
  
  function calculateMonths(emp) {
    if (!emp?.fromDate || !emp?.toDate) return 0;
    const diff = new Date(emp.toDate) - new Date(emp.fromDate);
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
  }
  