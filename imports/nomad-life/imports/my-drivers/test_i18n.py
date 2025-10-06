








import sys
sys.path.append('/workspace/my-drivers')

from utils.app_localizations import AppLocalizations

def test_i18n():
    print("Testing i18n implementation...")

    # Test English
    en_locale = 'en'
    en_localizations = AppLocalizations(en_locale)

    assert en_localizations.title == 'My Drivers', f"Expected 'My Drivers', got {en_localizations.title}"
    assert en_localizations.addDriverQRTitle == 'Add Driver via QR Code', f"Expected 'Add Driver via QR Code', got {en_localizations.addDriverQRTitle}"

    # Test Thai
    th_locale = 'th'
    th_localizations = AppLocalizations(th_locale)

    assert th_localizations.title == 'คนขับของฉัน', f"Expected 'คนขับของฉัน', got {th_localizations.title}"
    assert th_localizations.addDriverQRTitle == 'เพิ่มคนขับด้วย QR Code', f"Expected 'เพิ่มคนขับด้วย QR Code', got {th_localizations.addDriverQRTitle}"

    # Test new M1 strings
    assert en_localizations.scheduleRide == 'Schedule Ride', f"Expected 'Schedule Ride', got {en_localizations.scheduleRide}"
    assert th_localizations.scheduleRide == 'จองรถ', f"Expected 'จองรถ', got {th_localizations.scheduleRide}"

    print("✅ All i18n tests passed!")

if __name__ == "__main__":
    test_i18n()







