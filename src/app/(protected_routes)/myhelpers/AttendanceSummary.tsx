// components/AttendanceDrawer.tsx
import React, { useState } from 'react';
import {
    Drawer, Select, MenuItem, FormControl, InputLabel,
    Button, Grid, Typography, Divider,
    Box,
} from '@mui/material';
import { CalendarMonth, CheckCircle, AccessTime } from '@mui/icons-material';
import { AnimatePresence, motion } from 'framer-motion';
import { useSession } from 'next-auth/react';


type AttendanceSummary = {
    card_no: number;
    open: boolean;
    onClose: () => void;
};

const AttendanceSummary: React.FC<AttendanceSummary> = ({ card_no, open, onClose }) => {
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [attendanceDays, setAttendanceDays] = useState<Record<string, { type: string, time: string }[]>>({});
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [selectedDayTime, setSelectedDayTime] = useState<string | null>(null);
    const { data: session } = useSession();
    const [summary, setSummary] = useState<{ totalTime: string, totalMinutes: number, breakdown: Record<string, string> }>({
        totalTime: '',
        totalMinutes: 0,
        breakdown: {}
    });

    const fetchAttendance = async () => {
        const res = await fetch('http://139.84.166.124:8060/staff-service/attendance/summary/monthly/get', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                card_no: card_no,
                premise_id: session?.user?.primary_premise_id,
                year,
                month
            }),
        });
        const data = await res.json();
        console.log(data)

        setSummary({
            totalTime: data?.data?.totalTime || '',
            totalMinutes: data?.data?.totalMinutes || 0,
            breakdown: data?.data?.breakdown || {}
        });
        console.log(summary)
        setCalendarOpen(true);
    };

    const getDaysInMonth = (year: number, month: number) =>
        new Date(year, month, 0).getDate();

    const renderCalendar = () => {
        const days = getDaysInMonth(year, month);
        const firstDay = new Date(year, month - 1, 1).getDay();
        const blanks = Array(firstDay).fill(null);
        const filled = Array.from({ length: days }, (_, i) => i + 1);
        const allDays = [...blanks, ...filled];

        return (
            <Grid container spacing={1}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <Grid item xs={1.7} key={i} display="flex" justifyContent="center">
                        <Typography variant="caption" fontWeight="bold">
                            {d}
                        </Typography>
                    </Grid>

                ))}
                {allDays.map((day, i) => (
                    <Grid
                        item
                        xs={1.7}
                        key={i}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                    >
                        {day ? (
                            <Button
                                variant="text"
                                sx={{
                                    color: summary.breakdown[day] ? 'success.main' : 'text.secondary',
                                    borderRadius: 2,
                                    minHeight: 40,
                                    minWidth: 40,
                                    px: 0, // prevent extra horizontal padding
                                }}
                                onClick={() => {
                                    if (summary.breakdown[day]) {
                                        setSelectedDay(String(day));
                                        setSelectedDayTime(summary.breakdown[day]);
                                    }
                                }}

                            >
                                {summary.breakdown[day]?.length ? (
                                    <Box
                                        sx={{
                                            backgroundColor: 'success.light',
                                            color: 'success.contrastText',
                                            width: 32,
                                            height: 32,
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            borderRadius: '50%',
                                            fontSize: 14,
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        {day}
                                    </Box>
                                ) : (
                                    day
                                )}

                            </Button>
                        ) : (
                            <Box sx={{ height: 40, width: 40 }} />
                        )}
                    </Grid>

                ))}
            </Grid>
        );
    };

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    return (
        <>
            {/* Bottom Drawer: Month/Year Selector */}
            <Drawer
                anchor="bottom"
                open={open}
                onClose={onClose}
                PaperProps={{
                    sx: {
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        px: 2,
                        pt: 1,
                        pb: 3,
                        boxShadow: 10,
                    },
                }}
            >
                {/* Handle Bar */}
                <Box display="flex" justifyContent="center" mt={1} mb={2}>
                    <Box
                        sx={{
                            width: 40,
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: "grey.400",
                        }}
                    />
                </Box>

                {/* Title */}
                <Typography variant="subtitle1" fontWeight="bold" textAlign="center" gutterBottom>
                    Select Month & Year
                </Typography>

                <Divider sx={{ mb: 2 }} />

                {/* Year/Month Selection */}
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <FormControl fullWidth>
                            <InputLabel>Year</InputLabel>
                            <Select
                                value={year}
                                label="Year"
                                onChange={(e) => setYear(Number(e.target.value))}
                            >
                                {years.map((y) => (
                                    <MenuItem key={y} value={y}>
                                        {y}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth>
                            <InputLabel>Month</InputLabel>
                            <Select
                                value={month}
                                label="Month"
                                onChange={(e) => setMonth(Number(e.target.value))}
                            >
                                {months.map((m, idx) => (
                                    <MenuItem key={idx + 1} value={idx + 1}>
                                        {m}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>

                {/* Action Buttons */}
                <Button
                    variant="outlined"
                    startIcon={<CalendarMonth />}
                    fullWidth
                    sx={{ mt: 3, py: 1.2, borderRadius: 2, textTransform: "none" }}
                    onClick={fetchAttendance}
                >
                    Show Calendar
                </Button>

                <Button
                    onClick={onClose}
                    fullWidth
                    sx={{ mt: 1.5, py: 1.2, borderRadius: 2, textTransform: "none" }}
                    color="secondary"
                    variant="outlined"
                >
                    Close
                </Button>
            </Drawer>

            {/* Bottom Drawer: Calendar View */}
            <Drawer
                anchor="bottom"
                open={calendarOpen}
                onClose={() => setCalendarOpen(false)}
                PaperProps={{
                    sx: {
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        px: 2,
                        pt: 1,
                        pb: 3,
                        boxShadow: 10,
                    },
                }}
            >
                {/* Handle bar (Android style) */}
                <Box display="flex" justifyContent="center" mt={1} mb={2}>
                    <Box
                        sx={{
                            width: 40,
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: "grey.400",
                        }}
                    />
                </Box>

                {/* Header */}
                <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                    <CalendarMonth sx={{ color: "primary.main", mr: 1 }} />
                    <Typography variant="subtitle1" fontWeight="bold" textAlign="center">
                        Staff Attendance Summary — {months[month - 1]} {year}
                    </Typography>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Calendar with animation */}
                <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    {renderCalendar()}
                </motion.div>

                <Box mt={3} textAlign="center">
                    <AccessTime sx={{ color: 'primary.main', verticalAlign: 'middle', mr: 1 }} />
                    <Typography variant="body1" fontWeight="bold" component="span">
                        Total Worked Time: {summary.totalTime} ({summary.totalMinutes} minutes)
                    </Typography>
                </Box>

                {selectedDay && selectedDayTime && (
                    <Box
                        mt={3}
                        px={2}
                        py={2}
                        sx={{
                            backgroundColor: 'grey.100',
                            borderRadius: 2,
                            textAlign: 'center',
                        }}
                    >
                        <Typography variant="subtitle2" color="textSecondary">
                            Worked Time on {months[month - 1]} {selectedDay}, {year}
                        </Typography>
                        <Typography variant="h6" color="primary" fontWeight="bold">
                            {selectedDayTime}
                        </Typography>
                    </Box>
                )}

                {/* Close Button */}
                <Button
                    onClick={() => setCalendarOpen(false)}
                    variant="outlined"
                    fullWidth
                    sx={{
                        mt: 3,
                        borderRadius: 2,
                        py: 1.2,
                        textTransform: "none",
                    }}
                >
                    Close
                </Button>
            </Drawer>
        </>
    );
};

export default AttendanceSummary;