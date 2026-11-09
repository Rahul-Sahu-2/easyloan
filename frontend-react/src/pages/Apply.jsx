// Step 2: Verify PIN code using new PIN API
async function verifyPincode() {
  const pincode = formData.city.trim()

  setPinError('')
  setPinDetails(null)
  setPinVerified(false)

  if (!/^\d{6}$/.test(pincode)) {
    setPinError('Please enter a valid 6-digit PIN code.')
    return
  }

  setPinLoading(true)

  try {
    const response = await fetch(
      `https://api.pincodeapi.in/api/v1/pincode/${pincode}`
    )

    if (!response.ok) {
      throw new Error('PIN verification service is unavailable.')
    }

    const result = await response.json()

    if (
      result.success !== true ||
      !result.data ||
      !Array.isArray(result.data.post_offices) ||
      result.data.post_offices.length === 0
    ) {
      setPinError(
        'This PIN code does not exist. Please enter a valid PIN code.'
      )
      return
    }

    const postOffice = result.data.post_offices[0]

    setPinDetails({
      district: postOffice.district,
      state: postOffice.state,
      postOffice: postOffice.office_name,
    })

    setPinVerified(true)

  } catch (err) {
    setPinError(
      err.message || 'Unable to verify PIN code. Please try again.'
    )
  } finally {
    setPinLoading(false)
  }
}
