export const calculateAge = (dobString: string): string => {
  if (!dobString) return 'N/A';

  try {
    const dob = new Date(dobString);
    const today = new Date();

    let years = today.getFullYear() - dob.getFullYear();
    let months = today.getMonth() - dob.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    if (today.getDate() < dob.getDate()) {
      months--;
      if (months < 0) {
        years--;
        months += 12;
      }
    }

    return `${years} yrs ${months} mont`;
  } catch (error) {
    return 'N/A';
  }
};
