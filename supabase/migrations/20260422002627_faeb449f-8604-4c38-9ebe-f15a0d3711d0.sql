-- Ensure updated_at is refreshed whenever a complaint row changes (used for 4-day auto-hide of closed complaints)
DROP TRIGGER IF EXISTS complaints_touch_updated_at ON public.complaints;
CREATE TRIGGER complaints_touch_updated_at
BEFORE UPDATE ON public.complaints
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();