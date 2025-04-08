import request from '@/utils/request'
import { END_POINT } from '@/api/api'
import { ref } from 'vue'

export const isMaintenance = ref(false)

export const checkMaintenanceStatus = async () => {
    try {
        const response = await request.get(END_POINT.MAINTENANCE)
        isMaintenance.value = response.maintenance;
    } catch (error) {
        console.error('Không thể kết nối với API:', error)
    }
}
