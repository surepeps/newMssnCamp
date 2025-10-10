import { fetchJSON } from './api.js'

export async function fetchStates() {
  const states = [
    'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara','FCT Abuja'
  ]
  return states.map((s) => ({ value: s, label: s }))
}

export async function fetchMaritalStatuses() {
  return [{ value: 'Single', label: 'Single' }]
}

export async function fetchCourses() {
  return []
}

export async function fetchHighestQualifications() {
  return []
}

export async function fetchAilments({ page = 1, limit = 100, search = '' } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (search) params.set('ailment_name', search)
  const res = await fetchJSON(`/basic-needs/ailments?${params.toString()}`)
  const records = res?.data?.records || []
  return records.map((r) => ({ value: r.ailment_id, label: r.ailment_name }))
}

export async function fetchCouncils({ page = 1, limit = 200, search = '' } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (search) params.set('councilName', search)
  const res = await fetchJSON(`/basic-needs/councils?${params.toString()}`)
  const records = res?.data?.records || []
  return records.map((r) => ({ value: String(r.councilID), label: r.councilName }))
}

export async function fetchBranches(/* councilId */) {
  return []
}

export async function fetchSchoolsSecondary() {
  return []
}

export async function fetchSchoolsUndergrad() {
  return []
}

export async function fetchClassLevels(category) {
  switch (category) {
    case 'Secondary':
      return [
        { value: 'JSS1', label: 'JSS 1' },
        { value: 'JSS2', label: 'JSS 2' },
        { value: 'JSS3', label: 'JSS 3' },
        { value: 'SS1', label: 'SS 1' },
        { value: 'SS2', label: 'SS 2' },
        { value: 'SS3', label: 'SS 3' },
      ]
    case 'Undergraduate':
      return [
        { value: '100', label: '100' },
        { value: '200', label: '200' },
        { value: '300', label: '300' },
        { value: '400', label: '400' },
        { value: '500', label: '500' },
      ]
    case 'Others':
      return []
    case 'TFL':
      return []
    default:
      return []
  }
}
