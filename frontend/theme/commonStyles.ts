import { StyleSheet } from 'react-native';
import { Spacing, Radii, Shadows, Typography, Colors } from './tokens';

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.xxxl,
  },
  screenPadding: {
    paddingHorizontal: Spacing.medium,
    paddingVertical: Spacing.large,
  },
  header: {
    marginBottom: Spacing.xxl,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    width: '100%',
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    height: 50,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSize.md,
    borderWidth: 1,
    borderColor: Colors.textGrayMedium,
  },
  iconButton: {
    padding: Spacing.sm,
  },
  submitButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    borderRadius: Radii.md,
    marginTop: Spacing.lg,
    width: '100%',
    alignItems: 'center',
    backgroundColor: Colors.buttonBackgroundLight,
  },
  submitButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.buttonTextLight,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.xl,
  },
  modalView: {
    margin: Spacing.lg,
    borderRadius: Radii.xl,
    padding: Spacing.xxxl,
    alignItems: "center",
    ...Shadows.md,
  },
  closeButton: {
    borderRadius: Radii.xl,
    padding: Spacing.sm,
    elevation: 2,
    marginTop: Spacing.md,
  },
  textStyle: {
    fontWeight: Typography.fontWeight.bold,
    textAlign: "center",
  },
  categoryList: {
    maxHeight: 200,
    width: '100%',
  },
  formContainer: {
    width: '100%',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  categoryItem: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderColor: Colors.textGrayMedium,
  },
  categoryItemText: {
    fontSize: Typography.fontSize.md,
  },
  datePickerButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
  },
  card: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: Radii.medium,
    ...Shadows.card,
    padding: Spacing.medium,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.textGrayMedium,
    borderRadius: Radii.small,
    padding: Spacing.small,
    fontSize: Typography.fontSize.medium,
    fontFamily: Typography.fontFamily,
  },
  buttonPrimary: {
    backgroundColor: Colors.buttonBackgroundLight,
    borderRadius: Radii.medium,
    paddingVertical: Spacing.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimaryText: {
    color: Colors.buttonTextLight,
    fontSize: Typography.fontSize.large,
    fontWeight: Typography.fontWeight.bold,
  },
  timeErrorText: {
    fontSize: Typography.fontSize.small,
    color: Colors.textRed,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  datePickerButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    borderRadius: Radii.md,
    marginTop: Spacing.lg,
    width: '100%',
    alignItems: 'center',
    backgroundColor: Colors.buttonBackgroundLight,
  },
});